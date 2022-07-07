const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs")
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
    const { no } = params;
    connection.query(
    `select * from customers_table where no=${no}`,
        (err, rows, fields)=> {
            res.send(rows[0])
        }
    )
})

app.post("/customers", (req, res)=>{
    const body = req.body;
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail} = body;
    if(!c_name || !c_phone || !c_birth || !c_gender || !c_add || !c_adddetail) {
        res.send("모든 필드를 입력해주세요");
    } else {
        connection.query(
            `insert into customers_table (name, phone, birth, gender, add1, add2) values ('${c_name}', '${c_phone}', '${c_birth}', '${c_gender}', '${c_add}', '${c_adddetail}')`,
            (err, rows,fields) => {
                res.send("등록되셨습니다.")
            }
        )
       
    }
})


// 서버실행
app.listen(port, () => {
    console.log("고객 서버가 돌아가고 있습니다.")
})