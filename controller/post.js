const Post= require('../models/post.js')
const User= require('../models/user.js')

//create post
exports.CreatePost=async(req,res)=>{
  try {
    const { title, description } = req.body;
    if(!title || !description){
      return res.status(404).json({
        message:"all field are required"
      })
    }
    const file = req.files ? req.files['file'][0].path : null;
    const image = req.files ? req.files['image'][0].path : null;

    const newPost = new Post({
      title,
      description,
      file,
      image,
      user: req.user.id,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


//get post
exports.getPost=async(req,res)=>{
  try {
    const posts = await Post.find()
      .populate('user', 'name email username') // Populate the user field with name and email
      .exec();
    // Extract the filename from the path for each post
    const postsWithFilenames = posts.map(post => {
      const pdfFilename = post.pdf ? post.pdf.split('/').pop() : null;
      return { ...post._doc, pdfFilename };
    });
    res.json(postsWithFilenames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

// Get single file by ID
exports.getfile= async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username') // Populate only the name of the user
      .exec();
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


//get only own post
exports.getOwnPost=async(req,res)=>{
  try {
    const userId=req.user.id;
    const posts=await Post.find({user:userId})
    .populate('user','username name')
    .exec();
    res.json(posts)
  } catch (error) {
    console.log(error);
    
  }
}