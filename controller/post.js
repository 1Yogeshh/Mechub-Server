const Post = require('../models/post.js');
const User = require('../models/user.js'); // Make sure to import User if needed

// Create post
exports.CreatePost = async (req, res) => {
  try {
    const { title, description, image, file } = req.body;

    // Validate required fields
    if (!title || !description ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate the format of image and file URLs (basic validation)
    const isValidUrl = (url) => {
      const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+[a-z]{2,}|'+ // domain name
        'localhost|'+ // localhost
        '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|'+ // ipv4
        '\\[([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}\\])'+ // ipv6
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(url);
    };

    if (!isValidUrl(image) || !isValidUrl(file)) {
      return res.status(400).json({ message: "Invalid image or file URL" });
    }

    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create new post
    const newPost = new Post({
      title,
      description,
      file, // Could be Cloudinary file URL or file path
      image, // Could be Cloudinary image URL or file path
      user: req.user.id,
    });

    // Save post to the database
    await newPost.save();

    // Respond with the created post
    return res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("CreatePost Error:", error); // Log the entire error object
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


//get post
exports.getPost = async (req, res) => {
  try {
    // Get the current user's ID and the list of users they are following
    const currentUserId = req.user.id;
    
    // Assuming you have a 'following' field in your user schema which is an array of user IDs
    const currentUser = await User.findById(currentUserId).select('following');
    
    // Add the current user's ID to the list of followed users
    const followingUsers = [...currentUser.following, currentUserId];

    // Fetch posts that are created by the current user or by users they follow
    const posts = await Post.find({ user: { $in: followingUsers } })
      .populate('user', 'name email username img') // Populate user field with specific fields
      .exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ msg: 'No posts found' });
    }

    // Extract the filename from the path for each post
    const postsWithFilenames = posts.map(post => {
      const pdfFilename = post.pdf?.split('/').pop() || null; // Optional chaining to avoid errors
      return { ...post._doc, pdfFilename };
    });

    res.json(postsWithFilenames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// Get single post by ID
exports.getfile = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username img') // Populate only the name and username of the user
      .exec();

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // Check if the file URL is relative and needs a prefix
    if (post.file && !post.file.startsWith('http')) {
      post.file = `${req.protocol}://${req.get('host')}/${post.file}`; // Prefix with server URL if it's a local file
    }

    // Send the post with the populated user
    res.status(200).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' }); // Return JSON response for consistency
  }
}



//get only own post
exports.getOwnPost=async(req,res)=>{
  try {
    const userId=req.user.id;
    const posts=await Post.find({user:userId})
    .populate('user','username name img')
    .exec();
    res.json(posts)
  } catch (error) {
    console.log(error);
    
  }
}

// Get posts by user ID
exports.getUserPosts = async (req, res) => {
  try {
      const { userId } = req.params;
      const posts = await Post.find({ user: userId })
          .populate('user', 'username name img') // Adjust fields as necessary
          .exec();

      res.json(posts);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};
