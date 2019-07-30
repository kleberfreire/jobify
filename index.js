const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
// sqlite
const sqlite = require('sqlite')
const dbconnection = sqlite.open('banco.sqlite', { Promise })

// port
const port = process.env.PORT || 3000

const app = express()

// body-parser
app.use(bodyParser.urlencoded({ extended: true }))

// ejs

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// pasta arquivos estaticos
app.use(express.static('public'))

// rotas
app.get('/', async (req, res) => {
  const db = await dbconnection
  const categoriasDb = await db.all('select * from categorias;')
  const vagas = await db.all(`select * from vagas;`)
  const categorias = categoriasDb.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    }
  })

  res.render('home', {
    categorias
  })
})

app.get('/vagas/:id', async (req, res) => {
  const db = await dbconnection
  const vaga = await db.get('select * from vagas where id  = ' + req.params.id)
  res.render('vaga', {
    vaga
  })
})

app.get('/admin', (req, res) => {
  res.render('admin/home')
})

app.get('/admin/categorias', async (req, res) => {
  const db = await dbconnection
  const categorias = await db.all(`select * from categorias`)

  res.render('admin/categorias', { categorias })
})

app.get('/admin/categoria/nova', (req, res) => {
  res.render('admin/nova-categoria')
})

app.post('/admin/categoria/nova', async (req, res) => {
  const db = await dbconnection
  const { categoria } = req.body
  await db.run(`insert into categorias (categoria) values ('${categoria}')`)
  res.redirect('/admin/categorias')
})

app.get('/admin/categoria/update/:id', async (req, res) => {
  const db = await dbconnection
  const categoria = await db.get(`select * from categorias where id = ${req.params.id}`)
  res.render('admin/update-categoria', { categoria })
})

app.post('/admin/categoria/update/:id', async (req, res) => {
  const db = await dbconnection
  const { categoria } = req.body
  const { id } = req.params
  await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
  res.redirect('/admin/categorias')
})

app.get('/admin/categoria/delete/:id', async (req, res) => {
  const db = await dbconnection
  await db.run('delete from categorias where id = ' + req.params.id)
  res.redirect('/admin/categorias')
})

app.get('/admin/vagas', async (req, res) => {
  const db = await dbconnection
  const vagas = await db.all(`select * from vagas;`)

  res.render('admin/vagas', { vagas })
})

app.get('/admin/vagas/delete/:id', async (req, res) => {
  const db = await dbconnection
  await db.run('delete from vagas where id = ' + req.params.id)
  res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async (req, res) => {
  const db = await dbconnection
  const categorias = await db.all('select * from categorias;')
  res.render('admin/nova-vaga', { categorias })
})

app.post('/admin/vagas/nova', async (req, res) => {
  const db = await dbconnection
  const { titulo, descricao, categoria } = req.body

  await db.run(`insert into vagas (categoria, titulo, descricao) values ('${categoria}', '${titulo}', '${descricao}');`)
  res.redirect('/admin/vagas')
})

app.get('/admin/vagas/update/:id', async (req, res) => {
  const db = await dbconnection
  const vaga = await db.get('select * from vagas where id  = ' + req.params.id)
  const categorias = await db.all('select * from categorias;')

  res.render('admin/update-vaga', { vaga, categorias })
})

app.post('/admin/vagas/update/:id', async (req, res) => {
  const db = await dbconnection
  const { titulo, descricao, categoria } = req.body
  const id = req.params.id
  await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id};`)
  res.redirect('/admin/vagas')
})

// iniciando connection banco
const init = async () => {
  const db = await dbconnection
  await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
  await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
}

init()
// ouvindo a porta
app.listen(port, (err) => {
  if (err) {
    console.log(`Ocorreu um erro - ${err}`)
  } else {
    console.log(`funcionado na port ${port}`)
  }
})
