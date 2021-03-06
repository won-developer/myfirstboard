import routes from "../routes";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { getTime } from "./lib/getTime";
import { convertToTrees } from "./lib/comment";

export const getMake = (req, res) => {
  res.render("make");
};
export const postMake = async (req, res) => {
  const { title, content } = req.body;
  try {
    await Post.create({
      title,
      content,
      creator: req.user.id,
      createTime: getTime(new Date())
    });
  } catch (error) {
    res.redirect(routes.home);
  }
  res.redirect(routes.home);
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  let like;
  try {
    const post = await Post.findById(id)
      .populate("creator")
      .populate({ path: "comments", select: "exist" });
    if (req.user) {
      like = req.user.likes.indexOf(id);
    } else {
      like = -1;
    }
    const comments = await Comment.find({ post: id })
      .sort("createAt")
      .populate({ path: "creator", select: "name" })
      .populate({
        path: "parent",
        select: "creator",
        populate: {
          path: "creator",
          select: "name"
        }
      });
    const tree = convertToTrees(comments, "_id", "parent", "child");
    res.render("view", { pageTitle: "POST", post, like, tree });
  } catch (error) {
    res.redirect(routes.home);
  }
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    res.render("editBoard", { pageTitle: "EDIT", post });
  } catch (error) {
    res.redirect(routes.home);
  }
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(
      { _id: id },
      {
        title,
        content
      }
    );
  } catch (error) {
    res.redirect(routes.view(id));
  } finally {
    res.redirect(routes.view(id));
  }
};

export const Delete = async (req, res) => {
  const { id } = req.params;
  try {
    await Post.deleteOne({ _id: id });
    res.redirect(routes.home);
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    post.views += 1;
    post.save();
  } catch (error) {
    res.status(400);
  } finally {
    res.end();
  }
};
