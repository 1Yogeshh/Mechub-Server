const Post = require('../models/post');
const User = require('../models/user')

const updatePostsWithUserDetails = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        await Post.updateMany({ user: userId }, { $set: { username: user.username ,name:user.name} });
    } catch (error) {
        console.error('Error updating posts:', error);
    }
};

module.exports = updatePostsWithUserDetails;
