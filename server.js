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
const Motivacao = require('./assets/arrays');
const { config } = require('dotenv');

//Config JSON response
app.use(express.json());

//Open Route - Public Route

//home
app.get('/', (req, res) => {
    //render da view
    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('index.ejs', {href_user_login: href1,
                                href_cadastro_logoff: href2,
                                user_login: title1, 
                                cadastro_logoff: title2}); 
});

//login
app.get('/login', (req, res) => {
    let id = localStorage.getItem('id');
    let href1 = '/login';
    let href2 = '/cadastro';
    let title1 = 'Login';
    let title2 = 'Cadastre-se';
    if(id == undefined){
        res.render('login.ejs',{href_user_login: href1,
            href_cadastro_logoff: href2,
            user_login: title1, 
            cadastro_logoff: title2}); 
    }else{
        res.redirect('/user/'+id);
    }
});

//cadastro
app.get('/cadastro', (req, res) => {
    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('cadastro.ejs', {href_user_login: href1,
                                href_cadastro_logoff: href2,
                                user_login: title1, 
                                cadastro_logoff: title2}); 
});

//calculos
app.get('/calculos', (req, res) => {
    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('calculos.ejs', {href_user_login: href1,
                                href_cadastro_logoff: href2,
                                user_login: title1, 
                                cadastro_logoff: title2}); 
    
});

//deletar conta

app.get('/delete', (req, res)=>{
    let id = localStorage.getItem('id');

    let href1 = '/user/' + id;
    let href2 = '/logoff';
    let title1 = 'Meu perfil';
    let title2 = 'Logoff';

    res.render('deletar.ejs', {href_user_login: href1,
                                href_cadastro_logoff: href2,
                                user_login: title1, 
                                cadastro_logoff: title2,
                                userid: id}); 
})

//esporte Ideal
app.get('/quizEsporte', (req, res) => {
    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('esporteideal.ejs', {href_user_login: href1,
                                    href_cadastro_logoff: href2,
                                    user_login: title1, 
                                    cadastro_logoff: title2}); 
    
});

//motivacao
app.get('/motivacao', (req, res)=>{
    let href1, href2, title1, title2;
    let src = "";
    let width = "1";
    let height = "1";
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('motivacao.ejs', {href_user_login: href1,
                            href_cadastro_logoff: href2,
                            user_login: title1, 
                            cadastro_logoff: title2,
                            src: src,
                            width:width,
                            height: height,
                            display: "display: flex;"}); 
})

//Private Route
app.get("/user/:id", checkToken, async(req, res)=>{

    

    const id = req.params.id;

    let href1 = '/user/' + id;
    let href2 = '/logoff';
    let title1 = 'Meu perfil';
    let title2 = 'Logoff';
    
    //check if user exists
    const user = await User.findById(id, '-password');

    if(!user){

        return res.send("<script>alert('Usuário não encontrado'); window.location.href = '/login'; </script>");
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
                                    email: calculo.email,
                                    href_user_login: href1,
                                    href_cadastro_logoff: href2,
                                    user_login: title1, 
                                    cadastro_logoff: title2});
    }else{
        res.render('usuario.ejs', {nome: user.name,
                                   email: user.email,
                                   href_user_login: href1,
                                   href_cadastro_logoff: href2,
                                   user_login: title1, 
                                   cadastro_logoff: title2});
    }
    
     

    // module.exports = user;
});

function checkToken(req, res, next){
    
    
    
    const authHeader = localStorage.getItem('token');
    
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.send("<script>alert('Usuário não encontrado'); window.location.href = '/login'; </script>");
    }

    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)

        next()
    }catch(err){
        console.log(err);
    }
}

//Register User
app.post('/auth/cadastro',async(req, res)=>{
    
    const {name, email, password, confirmpassword} = req.body; 
    

    //validations
    if(!name){
        return res.send("<script>alert('Nome obrigatório'); window.location.href = '/cadastro'; </script>");
    }
    if(!email){
        return res.send("<script>alert('Email obrigatório'); window.location.href = '/cadastro'; </script>");
    }
    if(!password){
        return res.send("<script>alert('Senha obrigatória'); window.location.href = '/cadastro'; </script>");
    }

    if(password !== confirmpassword){ 
        return res.send("<script>alert('Senhas não conferem'); window.location.href = '/cadastro'; </script>");
    }

    //check if user exists
    
    const userExists = await User.findOne({email:email})

    if(userExists){
        return res.send("<script>alert('Utilize outro email, este ja está em uso'); window.location.href = '/cadastro'; </script>");
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

        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
        
        res.render('cadastroSucess.ejs', {href_user_login: href1,
            href_cadastro_logoff: href2,
            user_login: title1, 
            cadastro_logoff: title2})
    }catch(err){
        console.log(err)
        
    }


});


//login User
app.post("/auth/login", async (req, res) => {
    const {email, password} = req.body; 

    //validation
    if(!email){
        return res.send("<script>alert('Email Obrigatório'); window.location.href = '/login'; </script>") 
    }
    if(!password){
        return res.send("<script>alert('Senha Obrigatória'); window.location.href = '/login'; </script>");
    }

    //check if user exists
    const user = await User.findOne({email:email})

    if(!user){
        return res.send("<script>alert('Usuário não encontrado'); window.location.href = '/login'; </script>");
    }

    //check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword){
        return res.send("<script>alert('Senha incorreta, tente novamente'); window.location.href = '/login'; </script>");
    }

    try{
        const secret = process.env.SECRET;

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )
        
        
        try{
            localStorage.setItem('token', "Bearer " + token);
            localStorage.setItem('email', user.email);
            localStorage.setItem('id', user._id);
        }catch(err){
            console.log(err);
        }
        
        

        res.redirect('/user/' + user._id); 
        
    }catch(err){
        console.log(err);
    }
})


app.get('/logoff', (req, res)=>{
    
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    res.redirect('/'); 
})


//update informations
app.post('/user/change', async (req, res)=>{
    const {name, email} = req.body;
    try{
        await User.updateOne({email: email}, {name: name});
        const user = await User.findOne({email:email});
        res.redirect('/user/' + user._id); //TODO
    }catch(err){
        console.log(err);
    }
    
});

//Deletar conta
app.get('/deleteuser', async (req, res)=>{
    const id = localStorage.getItem('id');
    const user = await User.findOne(id);
    const calc = await Calculos.findOne(user.email);

    try{
        await User.deleteOne(user);
        await Calculos.deleteOne(calc);
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('id');
        res.send("<script>alert('Usuário removido com sucesso'); window.location.href = '/'; </script>");
    }catch(err){
        console.log(err);
    }
})


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

    
    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
     
    res.render('resultados.ejs', {
        tmb: tmb.toFixed(0),
        agua: agua.toFixed(0),
        carbo: carbo.toFixed(0),
        prot: prot.toFixed(0),
        gord: gord.toFixed(0),
        href_user_login: href1,
        href_cadastro_logoff: href2,
        user_login: title1, 
        cadastro_logoff: title2
    })
    
    
})

//salvar calculos
app.post('/salvarcalc', async (req, res) => {
    const{tmb, agua, carbo, prot, gord} = req.body;
    
    let email = localStorage.getItem("email");
    
    if(email == undefined){
        res.send("<script>alert('precisa estar logado'); window.location.href = '/login'; </script>");
    }else{
        const id = localStorage.getItem('id');
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
                res.redirect('/user/' + id);
            }catch(err){
                console.log(err);
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

    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('respostaEsporte.ejs', {href_user_login: href1,
                                    href_cadastro_logoff: href2,
                                    user_login: title1, 
                                    cadastro_logoff: title2,
                                    esporte: esporte,
                                    imgesporte:imgEsporte}); 

    
});

app.post('/resultadomotivacao', (req, res)=>{
    const {tipoV} = req.body;
    let src;
    
    switch(tipoV){
        case "Perna":
            src = Motivacao.motivacaoPerna[Math.floor(Math.random()*3)]
            break;
        case "Peito":
            src = Motivacao.motivacaoPeito[Math.floor(Math.random()*3)];
            break;
        case "Costas":
            src = Motivacao.motivacaoCostas[Math.floor(Math.random()*3)];
            break;
        case "Bracos":
            src = Motivacao.motivacaoBracos[Math.floor(Math.random()*2)];
            break;
        case "Ombros":
            src = Motivacao.motivacaoBracos[Math.floor(Math.random()*3)];
            break;
        case "Futebol":
            src = Motivacao.motivacaoFutebol[Math.floor(Math.random()*1)];
            break;
        case "Basquete":
            src = Motivacao.motivacaoBasquete[Math.floor(Math.random()*1)];
            break;
        case "Vida":
            src = Motivacao.motivacaoVida[Math.floor(Math.random()*2)];
            break;
    }

    let href1, href2, title1, title2;
    let id = localStorage.getItem('id');
    if(id == undefined){
        //deslogado
        href1 = '/login';
        href2 = '/cadastro';
        title1 = 'Login';
        title2 = 'Cadastre-se';
    }else{
        //logado
        href1 = '/user/' + id;
        href2 = '/logoff';
        title1 = 'Meu perfil';
        title2 = 'Logoff';
    }
    //render da view
    res.render('motivacao.ejs', {href_user_login: href1,
                                    href_cadastro_logoff: href2,
                                    user_login: title1, 
                                    cadastro_logoff: title2,
                                    src: src,
                                    width:560,
                                    height: 315,
                                    display: "display: none;"}); 
     
})

//Credencials
const dbUser = process.env.DB_USER //TODO
const dbPassword = process.env.DB_PASS //TODO

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.gwt1k.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(3000);
    console.log('Conectado ao banco!')
}).catch((err => console.log(err)))

