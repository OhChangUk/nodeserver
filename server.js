const express = require('express');
// require - 무언가를 불러오겠다라는 의미
const app = express();
// express를 세팅하겠다는 뜻
const dotenv = require('dotenv')
dotenv.config();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
// app.use 두개를 작성해야 body에서 값을 가져옴

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set("view engine", "ejs");
// ejs사용 세팅
app.use(express.static(__dirname + '/public'))

const {MongoClient, ObjectId} = require('mongodb');
let db;
let sample;
const url = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@cluster0.oz1pnru.mongodb.net/`
new MongoClient(url).connect().then((client)=>{
    db = client.db("board");
    sample = client.db("sample_restaurants");
    console.log("DB 연결 완료!")
    app.listen(process.env.SERVER_PORT, ()=>{
        console.log(`${process.env.SERVER_PORT}번 포트 서버 실행`)
    })
    
}).catch((error)=>{
    console.log(error)
})




app.get('/',(req,res)=>{
    // res.send("Hello World")
    res.sendFile(__dirname + '/page/index.html')
})

app.get('/about',(req,res)=>{
    // res.send("어바웃 페이지1")
    res.sendFile(__dirname + '/page/about.html')
    // db.collection("notice").insertOne({
    //     title: "첫번째 글",
    //     content : "두번째 글"
    // })
})
app.get('/list',async (req,res)=>{

    const result = await db.collection("notice").find().toArray()
    console.log(result[0])

    res.render("list.ejs", {
        data : result
    })
})

app.get('/view/:id', async (req,res)=>{
    const result = await db.collection("notice").findOne({
        _id : new ObjectId(req.params.id)
    })
    console.log(result)
    res.render("view.ejs", {
        data : result
    })
})

app.get('/write', (req,res)=>{
    res.render("write.ejs")
})

app.get('/test',(req,res)=>{
    res.send("테스트 페이지1")
})

app.post('/add',async (req,res)=>{
    console.log(req.body)
    await db.collection("notice").insertOne({
        title: req.body.title,
        content: req.body.content
    })
    // res.send("성공!")
    res.redirect('/list')
})

app.put('/edit',async (req,res)=>{
    // updateOne({문서},{
    // $set : {원하는 키 : 변경값}
    // })
    console.log(req.body)
    await db.collection("notice").updateOne({
        _id : new ObjectId(req.body._id)
    }, {
        $set :{
            title: req.body.title,
            content : req.body.content
        }
    })
    const result = "";
    res.send(result)
})


app.get('/delete/:id',async (req,res)=>{
    const result = await db.collection("notice").deleteOne({
        _id : new ObjectId(req.params.id)
    })
    res.redirect('/list')
})

app.get('/edit/:id',async (req,res)=>{
    const result = await db.collection("notice").findOne({
        _id : new ObjectId(req.params.id)
    })
    res.render('edit.ejs', {
        data: result
    })
})
// 1. Uniform Interface
// 여러 URL과 METHOD는 일관성이 있어야 하며, 하나의 URL에서는 하나의 데이터만 가져오게 디자인하며, 간결하고 예측 가능한 URL과 METHOD를 만들어야 한다.
// 동사보다는 명사 위주
// 띄어쓰기는 언더바 대신 대시 기호
// 파일 확장자는 사용금지
// 하위 문서를 뜻할 땐 / 기호를 사용

// 2. 클라이언트와 서버역할 구분
// 유저에게 서버 역할을 맡기거나 직접 입출력을 시키면 안된다.
// 3. stateless
// 요청들은 서로 의존성이 있으면 안되고, 각각 독립적으로 처리되어야 한다.
// 4. Cacheable
// 서버가 보내는 자료는 캐싱이 가능해야 한다. - 대부분 컴퓨터가 동작
// 5. Layered System
// 서버 기능을 만들 때 레이어를 걸쳐서 코드가 실행되어야 한다.(몰라도 됨)
// 6. Code on Demeand
// 서버는 실행 가능한 코드를 보낼 수 있다.(몰라도 됨)



