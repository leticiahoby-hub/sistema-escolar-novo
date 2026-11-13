import {admin,requireAdmin} from "./_supabaseAdmin.js";
export default async function handler(req,res){if(req.method!=="POST")return res.status(405).json({error:"Método não permitido"});try{await requireAdmin(req);const {nome,tipo,identificador,senha}=req.body||{};if(!nome||!senha||senha.length<6||!["aluno","professor"].includes(tipo)||!identificador)return res.status(400).json({error:"Confira os campos. A senha precisa ter ao menos 6 caracteres."});const isStudent=tipo==="aluno";const email=isStudent?`${String(identificador).trim()}@${process.env.STUDENT_EMAIL_DOMAIN||"alunos.sistema-escolar.com"}`:String(identificador).trim().toLowerCase();if(!isStudent&&!email.includes("@"))return res.status(400).json({error:"Informe um e-mail válido para o professor."});const {data,error}=await admin.auth.admin.createUser({email,password:senha,email_confirm:true,user_metadata:{nome}});if(error)throw error;const update={id:data.user.id,nome,tipo,matricula:isStudent?String(identificador).trim():null};const {error:pe}=await admin.from("perfis").upsert(update,{onConflict:"id"});if(pe){await admin.auth.admin.deleteUser(data.user.id);throw pe;}return res.status(200).json({ok:true});}catch(e){return res.status(400).json({error:e.message||"Erro ao cadastrar."});}}

import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica as configurações
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Configurações do Supabase não encontradas.");
}

// Cliente administrativo
export const admin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Verificação de administrador
export async function requireAdmin(req, res) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Acesso não autorizado."
      });
      return null;
    }

    const token = authorization.replace("Bearer ", "");

    const { data, error } = await admin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: "Sessão inválida ou expirada."
      });
      return null;
    }

    const user = data.user;

    const isAdmin =
      user.app_metadata?.role === "admin" ||
      user.app_metadata?.is_admin === true;

    if (!isAdmin) {
      res.status(403).json({
        error: "Acesso permitido somente ao administrador."
      });
      return null;
    }

    return user;

  } catch (error) {
    console.error("Erro na verificação:", error);

    res.status(500).json({
      error: "Erro interno ao verificar administrador."
    });

    return null;
  }
}
