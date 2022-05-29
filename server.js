
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const app = express();
const localStorage = require("localStorage");

app.use(bodyParser.urlencoded({extended: false}));

//static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/img', express.static(__dirname + 'public/img'));

//View
app.set('view engine', 'ejs');

//Models
const User = require('./models/User'); 
const Calculos = require('./models/Calculos'); 
const { config } = require('dotenv');

//Config JSON response
app.use(express.json());

//Open Route - Public Route

//home
app.get('/', (req, res) => {
    //render da view
    res.render('index.ejs'); 
});

//login
app.get('/login', (req, res) => {
    //render da view
    res.render('login.ejs'); 
});

//cadastro
app.get('/cadastro', (req, res) => {
    //render da view
    res.render('cadastro.ejs'); 
});

//calculos
app.get('/calculos', (req, res) => {
    //render da view
    res.render('calculos.ejs'); 
});

//esporte Ideal
app.get('/quizEsporte', (req, res) => {
    //render da view
    res.render('esporteideal.ejs'); 
});

//Private Route
app.get("/user/:id", checkToken, async(req, res)=>{

    const id = req.params.id;
    
    //check if user exists
    const user = await User.findById(id, '-password');

    if(!user){
        return res.status(404).json({msg: "Usuário nao encontrado"}); //TODO
    }

    //checar se usuario tem infos guardadas
    const calculo = await Calculos.findOne({email:user.email});
    if(calculo){
        
        res.render('usuario2.ejs', { nome: user.name,
                                    tmb: calculo.tmb,
                                    agua: calculo.agua,
                                    carboidrato: calculo.carboidrato,
                                    proteina: calculo.proteina,
                                    gordura: calculo.gordura,
                                    email: calculo.email});
    }else{
        res.render('usuario.ejs', {nome: user.name,
                                   email: user.email});
    }
    
     //TODO
    
    // module.exports = user;
});

function checkToken(req, res, next){
    
    console.log("Local" + localStorage.getItem('token'));
    
    const authHeader = localStorage.getItem('token');
    console.log("VAR" + authHeader);
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({msg: 'Acesso negado'}) //TODO
    }

    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)

        next()
    }catch(error){
        res.status(400).json({msg: "Token Invalido"}) //TODO
    }
}

//Register User
app.post('/auth/cadastro',async(req, res)=>{
    
    const {name, email, password, confirmpassword} = req.body; //TODO
    

    //validations
    if(!name){
        return res.status(422).json({msg: "O nome é obrigatório!"}); //TODO
    }
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"}); //TODO
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"}); //TODO
    }

    if(password !== confirmpassword){ 
        return res.status(422).json({msg: "As senhas não conferem!"}); //TODO
    }

    //check if user exists
    
    const userExists = await User.findOne({email:email})

    if(userExists){
        return res.status(422).json({msg: "Utilize outro email"}) //TODO
    }

    //create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create user
    const user = new User({
        name,
        email, 
        password: passwordHash,
    });

    try{

        await user.save();

        // res.status(201).json({msg: "usuario criado com sucesso"});
        res.send('<h1>Usuário Criado com sucesso</h1>' + '<a href="/login">Fazer login</a>'); //TODO
    }catch(error){
        res.status(500).json({msg: error}); //TODO
        
    }


});


//login User
app.post("/auth/login", async (req, res) => {
    const {email, password} = req.body; //TODO

    //validation
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"}); //TODO
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"}); //TODO
    }

    //check if user exists
    const user = await User.findOne({email:email})

    if(!user){
        return res.status(404).json({msg: "Usuário não encontrado"}) //TODO
    }

    //check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword){
        return res.status(422).json({msg: "Senha inválida"}) //TODO
    }

    try{
        const secret = process.env.SECRET;

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )

         
        
        // try{const tok = token;
        // console.log(user._id + " ----------- " + tok);}catch(err){console.log(err)}
        
        
        try{
            localStorage.setItem('token', "Bearer " + token);
            localStorage.setItem('email', user.email);
        }catch(err){
            console.log(err);
        }
        
        // res.status(200).json({msg: "Autenticação realizada com sucesso"});

        res.redirect('/user/' + user._id); //TODO
        
    }catch(err){
        res.status(500).json({msg: err}); //TODO
    }
})


app.get('/logoff', (req, res)=>{
    
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    res.redirect('/'); //TODO
})


//update informations
app.post('/user/change', async (req, res)=>{
    const {name, email} = req.body;
    try{
        await User.updateOne({email: email}, {name: name});
        const user = await User.findOne({email:email});
        res.redirect('/user/' + user._id); //TODO
    }catch(err){
        console.log("---------------------------------------------------" + err);
        res.send('<h1>FAILED</h1>' + 
             '<a href="/login"> Voltar para login</a>'); //TODO
    }
    
});


//Calculos
app.post('/resultado', (req, res)=>{
    const{sexo, altura, peso, idade, atividade} = req.body;
    // Masculino 184 90 21 Altamente_Ativo
    let fator;
    let tmb, carbo, prot, gord;
    switch(atividade){
        case("Sedentario"):
            fator = 1.2;
            break;
        case("Levemente_Ativo"):
            fator = 1.375;
            break;
        case("Moderadamente_Ativo"):
            fator = 1.55;
            break;
        case("Altamente_Ativo"):
            fator = 1.725;
            break;
        case("Extremamente_Ativo"):
            fator = 1.9;
            break;
        default:
            break;
        
    }
    if(sexo == "Masculino"){
        tmb = fator * (66+((13.7*peso)+(5*altura))-(6.8*idade));
        carbo = (tmb*0.4)/4;
        prot = (tmb*0.4)/4;
        gord = (tmb*0.2)/9;
    
    }else{
        tmb = fator * (65+((9.6*peso)+(1.8*altura))-(4.7*idade));
        carbo = (tmb*0.4)/4;
        prot = (tmb*0.4)/4;
        gord = (tmb*0.2)/9;
    }

    let agua = peso*35;

    
    res.render('resultados.ejs', {
        tmb: tmb.toFixed(0),
        agua: agua.toFixed(0),
        carbo: carbo.toFixed(0),
        prot: prot.toFixed(0),
        gord: gord.toFixed(0)
    })
    // console.log(sexo + " " + altura + " " + peso + " " + idade+ " " + atividade);
})

//salvar calculos
app.post('/salvarcalc', async (req, res) => {
    const{tmb, agua, carbo, prot, gord} = req.body;
    
    let email = localStorage.getItem("email");
    
    if(email == undefined){
        res.send("<script>alert('precisa estar logado'); window.location.href = '/login'; </script>");
    }else{
        const calculo = await Calculos.findOne({email:email});
        if(calculo){
            await Calculos.updateOne({email: email}, {
                tmb: tmb,
                agua: agua,
                carboidrato: carbo,
                proteina: prot,
                gordura: gord,
                email: email
            })
        }else{
            const calculo = new Calculos({
                tmb: tmb,
                agua: agua,
                carboidrato: carbo,
                proteina: prot,
                gordura: gord,
                email: email
            });

            try{
                await calculo.save();
                res.redirect('/');
            }catch(err){
                console.log("ERRO--->" + err);
            }
        }
    }
});

//calcular esporte ideal
app.post('/resultadoesporteideal', (req, res)=>{
    const{escolha1,escolha2,escolha3,escolha4,escolha5} = req.body;

    let esporte = "Desculpe, não descobrimos qual seu esporte ideal";
    let imgEsporte = "./img/not-found.gif";

    if(escolha1 == "Intospectivo"){ //se introspectivo
        if(escolha2=="diversão"){//se diversão
            if(escolha3=="ar_livre" || escolha3=="relaxantes"){
                if(escolha4=="individual"){
                    if(escolha5=="sim" || escolha5=="não"){
                        esporte = "Golf";
                        imgEsporte = "./img/golf.jpg";
                    }
                }
            }else{
                if(escolha4=="individual"){
                    if(escolha5=="não"){
                        esporte = "Yoga"
                        imgEsporte = "./img/yoga.jpg"
                    }
                }
            }
        }else{
            if(escolha2=="Adrenalina"){
                if(escolha3=="ar_livre"|| escolha3=="relaxantes"){
                    if(escolha5 == "não"){
                        esporte = "Montanhismo";
                        imgEsporte = "./img/mountaineering.jpg";
                    }
                }
            }else{
                if(escolha2=="Desestressar"|| escolha2=="Explorar_limites"){
                    if(escolha3=="ar_livre"){
                        if(escolha4=="individual"){
                            esporte="Natação";
                            imgEsporte = "./img/swimming.jpg";
                        }
                    }else{
                        if(escolha3=="fechado"){
                            if(escolha4=="individual"){
                                if(escolha5=="sim"){
                                    esporte="LPO (Levantamento de peso olimpico)"
                                    imgEsporte = "./img/lpo.jpg";
                                }else{
                                    esporte="Musculação"
                                    imgEsporte = "./img/workout.jpg";
                                }
                            }
                        }
                    }
                }
            }
        }



    }else{
        if(escolha1 == "Extrovertido" || escolha1 == "sociavel"){
            if(escolha2 == "diversão"){
                if(escolha3 == "ar_livre"){
                    if(escolha4 == "grupo"){
                        if(escolha5 == "sim"){
                            esporte = "Futebol";
                            imgEsporte = "./img/Soccer.jpg";
                        }
                    }else{
                        if(escolha5 == "sim"){
                            esporte = "Tênis";
                            imgEsporte = "./img/tennis.jpg";
                        }
                    }
                }else{
                    if(escolha3 == "fechado"){
                        if(escolha4 == "grupo"){
                            if(escolha5 == "sim"){
                                esporte = "Basquete";
                                imgEsporte = "./img/basketball.jpg";
                            }
                        }else{
                            if(escolha5 == "sim"){
                                esporte = "Badminton";
                                imgEsporte = "./img/badminton.jpg";
                            }
                        }
                    }
                }
            }else{
                if(escolha2 == "Adrenalina"){
                    if(escolha3 == "fechado"){
                        if(escolha4 == "individual"){
                            if(escolha5 == "não"){
                                esporte = "Salto Ornamental";
                                imgEsporte = "./img/salto_ornamental.jpg";
                            }
                        }
                    }else{
                        if(escolha5 == "não"){
                            esporte = "Rafting";
                            imgEsporte = "./img/rafting.jpg";
                        }
                    }
                }else{
                    if(escolha2 == "Desestressar"){
                        if(escolha3 == "fechado"){
                            if(escolha4 == "individual"){
                                if(escolha5 == "sim"){
                                    esporte = "Boxe";
                                    imgEsporte = "./img/boxe.jpg";
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    res.render('respostaEsporte.ejs', {esporte: esporte,
                                        imgesporte:imgEsporte});
});

//Credencials
const dbUser = process.env.DB_USER //TODO
const dbPassword = process.env.DB_PASS //TODO

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.gwt1k.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(3000);
    console.log('Conectado ao banco!')
}).catch((err => console.log(err)))

