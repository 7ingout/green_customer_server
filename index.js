const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dbinfo = fs.readFileSync('./database.json');
// 받아온 json 데이터를 객체형태로 변경 JSON.parse
const conf = JSON.parse(dbinfo)

// connection mysql연결 createConnection()
// connection.connect() 연결하기
// connection.end()연결종료
// connection.query('쿼리문', callback함수)
// callback(error, result, result의 field정보)


const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database:  conf.database
})
app.use(express.json());
app.use(cors());

// app.get("경로", 함수)
// connection.query("쿼리문", 함수)
app.get('/customers', async (req, res)=> {
    // connection.connect();
    connection.query(
        "select * from customers_table",
        (err, rows, fields)=> {
            // res.send("고객정보입니다.")
            res.send(rows)
            console.log(fields);
        }
    )
    // connection.end();
})

app.get('/detailview/:no', async (req, res)=> {
    const params = req.params;
    // const { no } = params;
    connection.query(
    `select * from customers_table where no=${params.no}`,
        (err, rows, fields)=> {
            res.send(rows[0])
        }
    )
})

// 내가한 것
// // addCustomer post 요청이 오면 처리
// app.post("/addCustomer", (req, res)=>{
//     const body = req.body;
//     const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail} = body;
//     if(!c_name || !c_phone || !c_birth || !c_gender || !c_add || !c_adddetail) {
//         res.send("모든 필드를 입력해주세요");
//     } else {
//         connection.query(
//             `insert into customers_table (name, phone, birth, gender, add1, add2) values ('${c_name}', '${c_phone}', '${c_birth}', '${c_gender}', '${c_add}', '${c_adddetail}')`,
//             (err, rows,fields) => {
//                 res.send("등록되셨습니다.")
//             }
//         )
       
//     }
// })


// addCustomer post 요청이 오면 처리 req => 요청하는 객체, res => 응답하는 객체
// mysql 쿼리 select / update / delete / insert
// insert into 테이블(컬럼1, 컬럼2, 컬럼3, ...) values(?, ?, ?)
// query("쿼리", [값1, 값2, 값3, 값4, 값5, 값6], 함수)
// insert into customers_table(name, phone, birth, gender, add1, add2)
// values(?, ?, ?, ?, ?, ?)
app.post("/addCustomer", async (req, res)=>{
    console.log(req)
    // const body = req.body;
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail} = req.body;
    connection.query(
        // `insert into customers_table (name, phone, birth, gender, add1, add2) values ('${c_name}', '${c_phone}', '${c_birth}', '${c_gender}', '${c_add}', '${c_adddetail}')`,
        "insert into customers_table(name, phone, birth, gender, add1, add2) values(?, ?, ?, ?, ?, ?)",
        [c_name, c_phone, c_birth, c_gender, c_add, c_adddetail],
        (err, rows,fields) => {
            res.send("등록되셨습니다.")
        }
    )
})

// 삭제요청 쳐리 /detailview/${no}
// delete from 테이블명 조건명
// delete from customers_table where no = no
app.delete('/detailview/:no', async (req, res)=> {
    const params = req.params;
    console.log('삭제');
    connection.query(
    `delete from customers_table where no=${params.no}`,
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})

// 수정요청
// update 테이블이름 set 컬럼명 = 값 where no = 값
// update customers_table set name='', phone='', birth='', gender='', add1='', add2='' where no=
// http://localhost:3001/edit/1
app.put('/edit/:no', async (req, res)=> {
    // 파라미터 값을 가지고 있는 객체
    const params = req.params;
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail} = req.body;
    console.log('수정');
    console.log(req.body);
    connection.query(
    `update customers_table set name='${c_name}', phone='${c_phone}', birth='${c_birth}', gender='${c_gender}', add1='${c_add}', add2='${c_adddetail}' where no=${params.no}`,
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 회원가입 요청
app.post("/join", async (req,res)=> {
    // green1234
    let myPlaintextPass = req.body.userpass;
    let myPass = "";
    if(myPlaintextPass != '' && myPlaintextPass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlaintextPass, salt, function(err, hash) {
                // Store hash in your password DB.
                myPass = hash;
                console.log(myPass);
                // 쿼리 작성
                const { username, userphone, userorg, usermail } = req.body;
                // connection.query 인자 첫번째: 쿼리문, 두번째: 쿼리문에 들어갈 값, 세번째: 처리 되면 하는 애
                connection.query("insert into customer_members(username, userpass, userphone, userorg, usermail, regdate) values(?,?,?,?,?,DATE_FORMAT(now(),'%Y-%m-%d'))",
                    [username, myPass, userphone, userorg, usermail],
                    (err, result, fields) => {
                        console.log(result)
                        console.log(err)
                        res.send("등록되었습니다.")
                    }
                )
            });
        });
    }
})

// 로그인 요청
app.post('/login', async (req, res)=> {
    // usermail 값에 일치하는 데이터가 있는지 select 문
    // userpass 암호화해서 쿼리 결과의 패스워드랑 일치하는지를 체크
    const {usermail, userpass} = req.body;
    connection.query(`select * from customer_members where usermail = '${usermail}'`,
        (err, rows, fileds)=>{
            if(rows != undefined) {
                if(rows[0] == undefined) {
                    res.send(null)
                } else {
                    // Load hash from your password DB.
                    bcrypt.compare(userpass, rows[0].userpass, function(err, result) {
                        // result == true
                        if(result == true) {
                            res.send(rows[0])
                        } else {
                            res.send('실패')
                        }
                    });
                }
            } else {
                res.send('실패')
            }
        }
    )
})

// 서버실행
app.listen(port, () => {
    console.log("고객 서버가 돌아가고 있습니다.")
})