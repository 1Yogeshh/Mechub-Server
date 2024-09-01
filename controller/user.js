const User= require('../models/user')
const jwt=require('jsonwebtoken')
const updatePostsWithUserDetails=require('../middleware/updatePost')


//register
exports.register=async(req,res)=>{
    try {
        const{name, username, email, password}=req.body;

        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                message:"user already exists",
                success:false
            })
        }

        user=await User.create({
            name, username, email, password
        })

        res.status(200).json({
            message:"create successfully",
            success:true
        })


    } catch (error) {
        return res.status(400).json({
            message:error
        })
    }
}



//login
exports.login=async(req,res)=>{
    try {
        const{email, password}=req.body;

        const user= await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                message:"user is not exists",
                success:false
            })
        }

        const isMatch= await user.matchPassword(password);

        if(!isMatch){
            return res.status(400).json({
                message:"password is not match",
                success:false
            })
        }


        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1y' });
        res.json({ token, user, success:true, message:"login successfully" });


    } catch (error) {
        console.log(error);
        
    }
}

//profile
exports.getProfile=async(req,res)=>{
    try {
        const user=await User.findById(req.user.id).select('-password').populate('followers following', 'username name about ')
        if(!user){
            return res.status(400).json({
                message:"user not found"
            })
        }
        res.json(user)
    } catch (error) {
        console.log(error);
        
    }
}

//update profile
exports.updateprofile=async(req,res)=>{
    try {
        const{name,username,email, about}=req.body;
        const userId = req.user._id;
        const user= await User.findById(userId)
        user.username = username || user.username;
        user.email = email || user.email;
        user.name = name || user.name;
        user.about=about || user.about;

        await user.save();
        // Update posts with new username
        await updatePostsWithUserDetails(userId);
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.log(error);
        
    }
}

//get all otherUser
exports.getOtherUser=async(req,res)=>{
    try {
        const currentUserId = req.user.id; // ID of the logged-in user
        const users = await User.find({ _id: { $ne: currentUserId } }).limit(5).select('-password'); // Exclude the logged-in user
        res.json(users);
    } catch (error) {
        console.log(error);
        
    }
}

//get specific user
exports.getUserProfile=async(req,res)=>{
    try {
        const { id } = req.params;
        const user= await User.findById(id).select("-password").populate('followers following', 'username name')
        res.json(user)
    } catch (error) {
        console.log(error);
        
    }
}


//follow a user
exports.followuser=async(req,res)=>{
    try {
        const { followId } = req.body;
        const user = await User.findById(req.user.id);
        if (user.following.includes(followId)) {
          return res.status(400).json({ message: "Already following this user" });
        }
        user.following.push(followId);
        await user.save();
        
        const userToFollow = await User.findById(followId);
        userToFollow.followers.push(req.user.id);
        await userToFollow.save();
        
        res.status(200).json({ message: "Followed successfully" });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
}

//unfollow a user
exports.unfollow=async(req,res)=>{
    try {
        const { followId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user.following.includes(followId)) {
          return res.status(400).json({ message: "Not following this user" });
        }
        user.following = user.following.filter(id => id.toString() !== followId);
        await user.save();
        
        const userToUnfollow = await User.findById(followId);
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);
        await userToUnfollow.save();
        
        res.status(200).json({ message: "Unfollowed successfully" });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
}

//get followers
exports.getFollowers=async(req,res)=>{
    try {
        const user= await User.findById(req.user.id).populate('followers','username name');
        res.json(user.followers)
    } catch (error) {
        console.log(error);
               
    }
}

//get following
exports.getFollowing=async(req,res)=>{
    try {
        const user= await User.findById(req.user.id).populate('following','username name')
        res.json(user.following)
    } catch (error) {
        console.log(error);
        
    }
}


//search users
exports.getSearchUsers=async(req,res)=>{
    try {
        const {query}= req.query;

        const users=await User.find({
            $or:[
                {name:{$regex:query,$options:'i'}},
                {username:{$regex:query,$options:'i'}}
            ]
        }).select('name username');

        res.json(users)

    } catch (error) {
        res.status(500).json({message:'server error'})
    }
}


// controllers/userController.js
exports.getProfileUsername = async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username })
        .select("-password")
        .populate('followers following', 'username name');
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Determine if the logged-in user is following this profile
      const isFollowing = user.followers.some(follower => follower._id.toString() === req.user.id);
  
      res.json({ ...user.toObject(), isFollowing });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  