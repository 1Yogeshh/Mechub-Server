const express= require('express')
const { register, login, getProfile, updateprofile, getOtherUser, getUserProfile, followuser, unfollow, getFollowers, getFollowing, getSearchUsers, getProfileUsername } = require('../controller/user')
const auth = require('../middleware/auth')
const { CreatePost, getPost, getfile, getOwnPost } = require('../controller/post')
const multer = require('multer');
const path = require('path');
const upload=require('../middleware/upload')

const router = express.Router();



//register
router.route("/signup").post(register)

//login
router.route("/login").post(login)
 
//create pots
router.route("/create").post( auth, upload.fields([{name:'file',maxCount:1},{name:"image",maxCount:1}]), CreatePost)

//getpost
router.route("/files").get(auth, getPost)

//specific post
router.route("/files/:id").get(getfile)

//own post
router.route("/ownpost").get(auth,getOwnPost)

//profile
router.route('/profile').get(auth,getProfile)

//update Profile
router.route("/updateprofile").put(auth,updateprofile)

//other all user
router.route("/otheruser").get(auth,getOtherUser)

//other user profile
router.route("/user/:id").get( getUserProfile)

//follow user
router.route("/follow").post(auth,followuser)

//unfollow
router.route("/unfollow").post(auth,unfollow)

//get followers
router.route('/followers').get(auth,getFollowers)

//get following
router.route('/following').get(auth,getFollowing)

//get searchuser
router.route('/search').get(auth,getSearchUsers)

//get profileusername
router.route('/profile/:username').get(auth,getProfileUsername)

module.exports=router