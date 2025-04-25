import { fileURLToPath } from "url";
import fs from "fs";
import Post from "../Models/postModel.js";
import PostRatings from "../Models/ratingModel.js"
import path, { dirname } from "path";


//---------------Создание поста-------------------

export const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;


    // Если файл загружен, используем URL, предоставленный Cloudinary (multer-storage-cloudinary)
    const imageUrl = req.file ? req.file.path : null;
    const imagePublicId = req.file ? req.file.filename : null; // или req.file.public_id, если так возвращается

    // const imageUrl = req.file
    //   ? `${process.env.SERVER_URL}/uploads/${req.file.filename}`
    //   : null;

    const newPost = new Post({
      title,
      content,
      imageUrl,
      imagePublicId,
      author: req.user._id,
      tags: tags ? JSON.parse(tags) : [],  // Преобразуем строку в массив
    });

    await newPost.save();

    const newRating = new PostRatings({
      postId: newPost._id,
      contentLength: content.length,
    });
    await newRating.save();

    res.status(201).json({ message: "Пост создан", post: newPost });
  } catch (error) {
    if(error.code instanceof multer.MulterError){
      if(error.code === "LIMIT_FILE_SIZE"){
        return res.status(400).json({ message: "Файл слишком большой! Максимум 10MB." });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Ошибка при создании поста" });
  }
};

//----------Вывод всех постов в HomeScreen---------------

export const getAllPosts = async (req, res) => {
  try {
    const {search} = req.query;
    let query = {};

    if(search){
      query = {
        $or: [
          { title: { $regex: search, $options: 'i'}},
          { tags: {$elemMatch: { $regex: search, $options: 'i' }}},
        ],
      };
    }

    const posts = await Post.find(query);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось загрузить посты" });
  }
};

//----------Вывод поста в стр PostDetailScreen-----------

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate('comments.author', 'username');
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Ошибка при загрузке поста:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

//------------Получение всех постов пользователя-----------

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ author: userId }).lean();

    const postIds = posts.map((post) => post._id)

    const ratings = await PostRatings.find({postId: {$in: postIds} });

    const ratingsMap = ratings.reduce((acc, rating) => {
      acc[rating.postId.toString()] = rating.rating;
      return acc;
    }, {})

    const postsWithRatings = posts.map((post) => ({
      ...post,
      rating: ratingsMap[post._id.toString()] || 0, // Если нет рейтинга, ставим 0
    }));

    res.json(postsWithRatings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении постов пользователя" });
  }
};

//---------------Удаление поста---------------------------

export const deletePosts = async (req, res) => {
  const { id: postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

     // Если изображение было загружено в Cloudinary, удаляем его через API
     if (post.imageUrl && post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
        console.log("Изображение удалено из Cloudinary:", post.imagePublicId);
      } catch (err) {
        console.error("Ошибка при удалении изображения из Cloudinary:", err);
      }
    }


    const deletePost = await Post.findByIdAndDelete(postId);
    if (!deletePost) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    res.status(200).json({ message: "Пост успешно удален" });
  } catch (error) {
    console.error("Error during post deletion:", error);
    res.status(500).json({ message: "Ошибка при удалении поста" });
  }
};

//-----------------Удаления рейтинга поста----------------
export const deletePostRating = async(req, res) => {
  try {
    const { id: postId} = req.params;

    const deletedRating = await PostRatings.findOneAndDelete({postId});
    
    if(!deletedRating){
      return res.status(404).json({message: "Рейтинг поста отсутствовал или уже удален"});
    }

    res.json({message: "Рейтинг поста удален" })
  } catch (error) {
    console.error("Ошибка при удалении рейтинга поста:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
//------------------Обновление комментариев-----------------

export const updateComments = async (req, res) => {
  const { text } = req.body;
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Пост не найден' });

    const comment = {
      text,
      author: req.user._id,
      createdAt: new Date(),
    }

    post.comments.push(comment);
    await post.save();
    const commentsCount = post.comments.length;

    //Обновляем рейтинг
    const ratingPost = await PostRatings.findOne({ postId: postId });
    if (ratingPost) {
      console.log(ratingPost);
      ratingPost.commentsCount = commentsCount;
      ratingPost.rating = parseFloat(calculateRating({
        commentsCount: ratingPost.commentsCount,
        likes: ratingPost.likes,
        contentLength: ratingPost.contentLength,
      }).toFixed(1));
      await ratingPost.save();
    }

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).send({ comment: newComment })
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    res.status(500).json({ message: 'Не удалось добавить комментарий. Попробуйте снова.' });
  }

}

//---------------Добавление или удаление лайков-----------------

export const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const postRating = await PostRatings.findOne({ postId: id })
    let alreadyLiked = false;
    
    if (!postRating) {
      const post = await Post.findById(id);
      
      postRating = new PostRatings({
        postId: id,
        likes: [userId], // Добавляем текущего пользователя в массив лайков
        contentLength: post.content.length, // Длина контента поста
        rating: 0, // Начальный рейтинг
      });
    } else {
      alreadyLiked = postRating.likes.includes(userId);

      if (alreadyLiked) {
        postRating.likes = postRating.likes.filter((like) => like.toString() !== userId.toString());
      } else {
        postRating.likes.push(userId);
      }

      postRating.rating = calculateRating({
        commentsCount: postRating.commentsCount,
        likes: postRating.likes,
        contentLength: postRating.contentLength,
      });

      postRating.rating = parseFloat(postRating.rating.toFixed(1)); // Округляем до 1 знака

      await postRating.save()
      
      res.status(200).json(
        {
          message: 'Like toggled successfully',
          liked: !alreadyLiked, // статус лайка
          likesCount: postRating.likes.length, // количество лайков
          rating: postRating.rating,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

//-------------
export const getPostsLikes = async(req, res) => {
  try {
    const postId = req.params.id;

    // Находим документ рейтинга для заданного поста
    const rating = await PostRatings.findOne({postId}).populate('likes', '_id');

    if(!rating){
      return res.status(404).json({message: "Рейтинг для данного поста не найден" })
    }
    
    const likesCount = rating.likes.length;

    let likedByUser = false;
    if(req.user){
      likedByUser = rating.likes.some(user => user._id.toString() === req.user._id.toString());
    }
    res.json({ likesCount, likedByUser });
  } catch (error) {
    console.error("Ошибка при получении лайков:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
//-------------------Рассчёт общего рейтинга-----------------------

const calculateRating = ({ commentsCount, likes, contentLength }) => {
  let rating = 0;

  // Лайки: максимум 40 очков
  const likeScore = Math.min(likes.length * 2, 40);
  rating += likeScore;

  // Комментарии: максимум 30 очков
  const commentScore = Math.min(commentsCount * 1.5, 30);
  rating += commentScore;

  // Контент: максимум 30 очков
  let contentScore = 0;
  if (contentLength <= 50) {
    contentScore = contentLength * 0.1;
  } else if (contentLength <= 150) {
    contentScore = contentLength * 0.2;
  } else {
    contentScore = Math.log10(contentLength) * 5; //log(1000) = 3
  }
  contentScore = Math.min(contentScore, 30);
  rating += contentScore;

  return Math.min(rating, 100);
};
