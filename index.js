const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const connection = require('./database/database')
const Pergunta = require('./database/Pergunta')
const Resposta = require('./database/Resposta')

// Database
connection.authenticate().then(() => {
    console.log('Conexão feita com o Banco de Dados')
}).catch((msgErro) => {
    console.log('Está dando erro aq ó: ' + msgErro)
})


// Estou dizendo para o Express usar o EJS como View Engine
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Body-Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Rotas
app.get('/', (req, res) => {
    // Select * from Perguntas
    Pergunta.findAll({
        raw: true, order: [
            ['id', 'DESC'] // ASC = Crescente || DESC = Decrescente
        ]
    }).then(perguntas => {
        console.log(perguntas)
        res.render('index', {
            perguntas: perguntas
        })
    })
})

app.get('/perguntar', (req, res) => {
    res.render("perguntar")
})

app.post('/salvarpergunta', (req, res) => {
    var titulo = req.body.titulo
    var descricao = req.body.descricao

    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/")
    }).catch(() => {
        console.log("Error")
    })
})

app.get('/pergunta/:id', (req, res) => {
    var id = req.params.id
    Pergunta.findOne({
        where: { id: id }
    }).then(pergunta => {
        if (pergunta != undefined) { // Pergunta foi encontrada

            Resposta.findAll({
                where: { perguntaId: pergunta.id },
                order: [['id', 'DESC']]
            }).then(respostas => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                })
            })

        } else {  // Não encontrada
            res.redirect('/')
        }
    })

    app.post('/responder', (req, res) => {
        var corpo = req.body.corpo
        var perguntaId = req.body.pergunta
        Resposta.create({
            corpo: corpo,
            perguntaId: perguntaId
        }).then(() => {
            res.redirect('/pergunta/' + perguntaId)
        })
    })
})

app.listen(8080, () => {
    console.log('App rodando na porta: http://localhost:8080')
})