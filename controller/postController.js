const { appError, handleErrorAsync } = require('../utils/errorHandler');
const getHttpResponse = require('../utils/successHandler');

const validator = require('validator');

const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

const posts = {
  // 取得全部貼文或個人全部貼文
  getAllPosts: handleErrorAsync(async (req, res, next) => {
    const { query, params: { userId } } = req
    const timeSort = query.sort === "asc" ? 1 : query.sort === 'desc' ? -1 : 'asc'
    const currentPage = Number(query.page)
    const perPage = query.perPage ? Number(query.perPage) : 10
    const queryString = query.q !== undefined
      ? {
        $or: [
          { "content": new RegExp(query.q.trim()) }
        ],
        'logicDeleteFlag': false,
      }
      : {}

    if(userId){
      queryString.editor = userId
    }

    // 向 DB 取得貼文資料
    const allPosts = await Post.find(queryString).populate({
      path: 'editor',
      select: 'nickName avatar'
    }).skip((currentPage - 1) * perPage).limit(perPage).sort({ 'createdAt': timeSort })

    const total = allPosts.length
    const totalPages = Math.ceil(allPosts.length / perPage)
    const resData = {
      message: allPosts.length === 0 ? '搜尋無資料' : '成功取得搜尋貼文',
      list: allPosts,
      page: {
        totalPages,
        currentPage,
        perPage,
        totalDatas: total,
        has_pre: allPosts.length === 0 ?  false : currentPage > 1,
        has_next: allPosts.length === 0 ?  false : currentPage < totalPages
      }
    }

    res.status(200).json(getHttpResponse(resData));
  }),

  // 新增貼文
  postOnePost: handleErrorAsync(async (req, res, next) => {
    const { user, body: { content, image } } = req;

    // 判斷圖片開頭是否為 http
    if (image && image.length > 0) {
      image.forEach(function (item, index, array) {
        let result = item.split(":");
        
        if (!validator.equals(result[0], 'https')) {
          return next(appError(400, '格式錯誤', '圖片格式不正確!'));
        }
      });
    }

    if (!content)
      return next(appError(400, '格式錯誤', '欄位未填寫正確!'));

    await Post.create({ editor: user, content, image });
    const newPost = await Post.find({}).sort({_id:-1}).limit(1).select('-logicDeleteFlag');

    res.status(201).json(getHttpResponse(newPost));
  })
}

module.exports = posts;