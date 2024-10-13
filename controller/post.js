const Post = require('../models/post.js');
const User = require('../models/user.js');

// Create post
exports.CreatePost = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle file upload if present
    const file = req.files && req.files['file'] ? req.files['file'][0].path : null;
    const image = req.files && req.files['image'] ? req.files['image'][0].path : req.body.image || null;

    // Create new post
    const newPost = new Post({
      title,
      description,
      file, // Null if no file uploaded
      image, // Could be Cloudinary image URL or file path
      user: req.user.id,
    });

    // Save post to the database
    await newPost.save();

    // Respond with the created post
    return res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("CreatePost Error:", error.message);
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

    res.json(post);
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
