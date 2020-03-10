var express = require('express');
var app = express('');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session')
var cors = require('cors');

app.use(session({ secret: 'cmvnbalksdjriut2554sdfkjgh' }));
app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // para recibir info de formulario
app.use(express.json());
app.use(cors());

mongoose.Promise = global.Promise;

/* async function contectar() {
    await mongoose.connect(
        'mongodb://localhost:10.128.35.136:27017/curso',
        {useNewUrlParser: true}
    )
        console.log('Conectado!');
}
contectar();
*/
// Promise - Then

mongoose.connect(
    'mongodb://127.0.0.1',
    { useNewUrlParser: true }
).then(function () {
    console.log('Conectado');
})

const ArtistaSchema = mongoose.Schema({
    nombre: String,
    apellido: String,
})

const ArtistaModel = mongoose.model('Artista', ArtistaSchema);

app.get('/alta', function (req, res) {
    res.render('formulario');
})

app.post('/alta', async function (req, res) {

    if (req.body.nombre == '') {
        res.render('formulario', {
            error: 'El campo es obligatorio',
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        })
        return;
    }

    await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    })
    res.redirect('/listado');
});

app.get('/listado', async function (req, res) {
    if (!req.session.user_id) {
        res.redirect('/login');
        return;
    }
    var abc = await ArtistaModel.find().lean();
    res.render('listado', { listado: abc });
});



app.get('/', async function (req, res) {
    var listado = await ArtistaModel.find();
    res.send(listado);
});

app.get('/buscar/:id', async function (req, res) {
    var listado = await ArtistaModel.find({ _id: req.params.id });
    res.send(listado);
});

app.get('/agregar', async function (req, res) {
    var nuevoArtista = await ArtistaModel.create(
        { nombre: 'Alan', apellido: 'Lopez' }
    );
    res.send(nuevoArtista);
});

app.get('/modificar', async function (req, res) {
    await ArtistaModel.findByIdAndUpdate(
        { _id: '5e5709228db5d72ae0c1b642' },
        { nombre: 'NuevoNombre', apellido: 'NA' }
    );
    res.send('ok');
});

app.get('/borrar', async function (req, res) {
    await ArtistaModel.findByIdAndRemove(  //var rta = await ArtistaModel.findByIdAndRemove(
        { _id: '5e5709228db5d72ae0c1b642' }
    );
    res.send('ok'); // res.send(rta);
});

app.get('/borrar/:id', async function (req, res) {
    await ArtistaModel.findByIdAndRemove(
        { _id: req.params.id });
    res.redirect('/listado');
});
app.get('/editar/:id', async function (req, res) {
    var artista = await ArtistaModel.findById(
        { _id: req.params.id }
    ).lean();
    res.render('formulario', { datos: artista });
});

app.post('/editar/:id', async function (req, res) {
    if (req.body.nombre == '') {
        res.render('formulario', {
            error: 'El campo es obligatorio',
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        })
        return;
    }
    await ArtistaModel.findByIdAndUpdate(
        { _id: req.params.id },
        {
            nombre: req.body.nombre,
            apellido: req.body.apellido
        }
    );
    res.redirect('/listado');
});

app.get('/formulario', async function (req, res) {
    var listados = await ArtistaModel.find();
    res.render('formulario', { alta: listados });
});

app.get('/contar', function (req, res) {
    if (!req.session.contador) {
        req.session.contador = 0;
    }
    req.session.contador++;
    res.json(req.session.contador);
});

app.get('/login', function (req, res) {
    res.render('login');
});

//app.post('/login', function(req,res) {   
//    if(req.body.username=='admin' && req.body.password=='admin123') ; 
//    res.send('Usuario correcto');
// }); 

const UsuarioSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
})
const UsuarioModel = mongoose.model('usuario', UsuarioSchema);
UsuarioModel.create({
    //    username: 'admin',
    //   password: 'admin123',
    //    email: 'admin@gmail.com'
});

app.post('/login', async function (req, res) {
    var usuarios = await UsuarioModel.find({
        username: req.body.username,
        password: req.body.password
    });
    if (usuarios.length != 0) {
        req.session.user_id = usuarios[0]._id;
        res.redirect('/listado');
    } else {
        res.send('incorrecto');
    }
});

app.get('/signin', function (req, res) {
    res.render('signin_form');
});

app.post('/signin', async function (req, res) {
    if (req.body.username == '' || req.body.password == '') {
        res.render('signin_form', {
            error: 'El campo es obligatorio',
            datos: req.body
        });
        return;
    }
    await UsuarioModel.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    res.redirect('/login');
});




// API
app.get('/api/artistas', async function (req, res) {
    var listado = await ArtistaModel.find().lean();
    res.json(listado);
});

app.get('/api/artistas/:id', async function (req, res) {
    try {
        var unArtista = await ArtistaModel.findById(req.params.id);
        res.json(unArtista);
    } catch (e) {
        res.status(404).send('error');
    }
});

app.post('/api/artistas', async function (req, res) {
    var artista = await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });
    res.json(artista);
});
app.put('/api/artistas/:id', async function (req, res) {
    try {
        await ArtistaModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        );
        res.status(200).send('ok');
    } catch (e) {
        res.status(404).send('error');
    }
});

app.delete('api/artistas/:id', async function (req, res) {
    try {
        await ArtistaModel.findOneAndDelete(req.params.id);
        res.status(204).send();
    } catch (e) {
        res.status(404).send('no encontrado')
    }
});







app.listen(80, function () {
    console.log('App en localhost');
});