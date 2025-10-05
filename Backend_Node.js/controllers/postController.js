const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const createHistory = async (req, res) => {
  const userId = req.body.userId;
  const url = req.body.url;
  const platform = req.body.platform
  const postData = req.body.postData

  try {
   
    const create = await prisma.postHistory.create({
        data : {
            userId : userId,
            url : url,
            platform : platform,
            postData : postData
            
        }
    })

    res.status(200).json(create);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async(req,res) =>{
    try {
        const userId = req.params.id
        const user = await prisma.user.findFirst({where : {id : userId}});
        if(!user){
            res.status(404).json({message : "User Not Found"})
        }

        const data = await prisma.postHistory.findMany({
            where : {userId : userId},
            orderBy : {
                createdAt : "desc"
            }
        })

        res.json(data)

    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const updateHistory = async (req,res) => {
    try {

        const postId = req.params.id
        const res = await prisma.postHistory.update({
            where : {id : postId} ,
            data : {title : req.body.title}
        })
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}


const getMockUpPost = async (req ,res) => {
    try {
        const post = await prisma.post.findFirst();
        res.json(post)
    } catch (error) {
        res.status(500).json({message : error.message})
        console.log(error.message)
    }
}






module.exports = {createHistory , getHistory , updateHistory , getMockUpPost};