import {getTodosPosts, criarPost, atualizaPost} from "../models/postsModel.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js"

export async function listarPosts(req, res) {
    const posts = await getTodosPosts();
    res.status(200).json(posts);
}

export async function postarNovoPost(req,res) {
    const novoPost = req.body;
    try {
        const postCriado = await criarPost(novoPost);
        res.status(201).json(postCriado);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({"Erro": "falha na requisição"});
    }
}

export async function uploadImagem(req,res) {
    const novoPost = {
        descricao : "",
        imgUrl : req.file.originalname,
        alt:""
    };
    try {
        const postCriado = await criarPost(novoPost);
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;
        fs.renameSync(req.file.path, imagemAtualizada);
        res.status(201).json(postCriado);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({"Erro": "falha na requisição"});
    }
}

export async function atualizarNovoPost(req,res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:300/${id}.png`;

    try {
        const imgBuffer = fs.readFileSync(`uploads/${id}.png`);
        const descricao = await gerarDescricaoComGemini(imgBuffer);
        const post ={
            imgUrl: urlImagem,
            descricao: descricao,
            alt: req.body.alt
        }

        const postCriado = await atualizaPost(id, post);
        res.status(201).json(postCriado);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({"Erro": "falha na requisição"});
    }
}