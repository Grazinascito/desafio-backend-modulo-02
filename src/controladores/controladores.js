 const bancodedados = require("../bancodedados");
 const { contas } = require("../bancodedados");
 const { validarConta, validarTransfer } = require("../intermediario");
 const {format} = require('date-fns');
 
 let saldoConta = 0;
 let numeroConta = 1;

 function listarContas(req, resp) { 
     
    if(req.query.senha_banco !== 'Cubos123Bank'){
        resp.status(400).json({erro: "senha incorreta"});
    }
    resp.status(200).json(contas);
    
}

 function criarConta(req, resp){

    const erro = validarConta(req.body);
    if(erro){
        resp.status(400).json({erro});
        return;
    }

    const validaCpf = contas.find(item => item.usuario.cpf === req.body.cpf);
    if(validaCpf){
        resp.status(400).json({erro: "esse cpf já existe"});
        return;
    }
    const validaEmail = contas.find(item => item.usuario.email === req.body.email);
    if(validaEmail){
        resp.status(400).json({erro: "esse email já existe"});
        return;
    }

     const novaConta = {
         numero: numeroConta,
         saldo: saldoConta,
         usuario: {
             nome: req.body.nome,
             cpf: req.body.cpf,
             data_nascimento: req.body.data_nascimento,
             telefone: req.body.telefone,
             email: req.body.email,
             senha: req.body.senha
        }
    };

     contas.push(novaConta);

     numeroConta += 1;
     
     resp.status(201).json(novaConta);
     
}

 function atualizarUsuarioConta(req, resp){

    const {numeroConta} = req.params;
    const atualizandoConta = contas.find(usuarioConta => usuarioConta.numero === Number(numeroConta));
    const {nome, cpf, data_nascimento, telefone, email, senha} = req.body;
    
    if(atualizandoConta){
      
            if(req.body.senha !== atualizandoConta.usuario.senha || !req.body.senha){
                
                resp.status(400).json({erro: "Insira ao menos a senha de usuario"});
                return;
            } 
            
            const validaCpf = contas.find(item => item.cpf === req.body.cpf);
            if(validaCpf && req.body.cpf){
                resp.status(400).json({erro: "esse cpf já existe"});
                return;
            }
            const validaEmail = contas.find(item => item.email === req.body.email);
            if(validaEmail && req.body.email){
                resp.status(400).json({erro: "esse email já existe"});
                return;
            }

             atualizandoConta.usuario.nome = nome ? nome : atualizandoConta.usuario.nome;
             atualizandoConta.usuario.cpf = cpf ? cpf : atualizandoConta.usuario.cpf;
             atualizandoConta.usuario.data_nascimento = data_nascimento ? data_nascimento : atualizandoConta.usuario.data_nascimento;
             atualizandoConta.usuario.telefone = telefone ? telefone : atualizandoConta.usuario.telefone;
             atualizandoConta.usuario.email = email ?  email : atualizandoConta.usuario.email;
             atualizandoConta.usuario.senha = senha ? senha : atualizandoConta.usuario.senha;

             resp.status(200).json({
                mensagem: "Conta atualizada com sucesso!"
            });
       
    }else{
        resp.status(400).json({
            mensagem: "Usuario não encontrado"
        });
    }

}

 function deletarConta(req, resp){
     const {numeroConta} = req.params;

     const excluirConta = contas.find(usuarioConta => usuarioConta.numero === Number(numeroConta));

     if(excluirConta){
            if(excluirConta.saldo > 0){
                resp.status(400).json({mensagem: "Não foi possível excluir a conta com saldo positivo"});
                return;
            }else{
                const pegandoIndice = contas.indexOf(excluirConta);
                
                contas.splice(pegandoIndice,1);
           
                resp.status(200).json({mensagem: "conta excluida com sucesso!"});
            }
    }else{
        resp.status(400).json({mensagem: "conta não encontrada"});
    }

}

 function deposito(req, resp){

    if(!req.body.numero_conta){
        resp.status(400).json({mensagem: "numero não encontrado"});
        return;
    }

   if(!req.body.valor){
    resp.status(400).json({mensagem: "Valor inexistente"});
    return;
   }

   
   const procurandoConta = contas.find(conta => conta.numero === req.body.numero_conta);
   
   if(procurandoConta){
       if(req.body.valor > 0){
            procurandoConta.saldo += (req.body.valor);

            bancodedados.depositos.push({
                data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                numero_conta: req.body.numero_conta,
                valor: req.body.valor
            
            });
            resp.status(200).json({mesagem: "deposito feito com sucesso"});
            return;
        }
    }

}

 function sacar(req, resp){
    if(!req.body.numero_conta){
        resp.status(400).json({mensagem: "numero não encontrado"});
        return;
    }

   if(!req.body.valor){
    resp.status(400).json({mensagem: "Valor inexistente"});
    return;
   }

   const procurandoConta = contas.find(conta => conta.numero === req.body.numero_conta);
   
   if(procurandoConta){
       if(procurandoConta.saldo >= req.body.valor){
            procurandoConta.saldo -= (req.body.valor);

            bancodedados.saques.push({
                data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                numero_conta: req.body.numero_conta,
                valor: req.body.valor
            });
            resp.status(200).json({mensagem: "saque feito com sucesso"});
            return;
       }else{
            resp.status(400).json({mensagem: "Saldo Insuficiente para saque"});
            return;
        }
    }
}

 function transferir(req, resp){

    const erro = validarTransfer(req.body);
    if(erro){
        resp.status(400).json({erro});
        return;
    }

    const achandoConta = contas.find(item => item.numero === req.body.numero_conta_origem)

    if(achandoConta.numero !== req.body.numero_conta_origem){

        resp.status(400).json({mensagem:`conta ${req.body.numero_conta_origem} não existe`});
        return;
    }else{
        const achandoDestino = contas.find(item => item.numero === req.body.numero_conta_destino);

        if(!achandoDestino){
            resp.status(400).json({mensagem: `conta ${req.body.numero_conta_destino} não existe`});
            return;
        }

        if(achandoDestino.numero !== req.body.numero_conta_destino){
            resp.status(400).json({mensagem: "conta não existe"});
            return;
        }else{
            if(achandoConta.usuario.senha === req.body.senha){
                if(achandoConta.saldo >= req.body.valor){
                
                    achandoConta.saldo -= req.body.valor;
                    achandoDestino.saldo += req.body.valor;
    
                    bancodedados.transferencias.push({
                        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                        numero_conta_origem: req.body.numero_conta_origem,
                        numero_conta_destino: req.body.numero_conta_destino,
                        valor: req.body.valor
                    });
    
                    resp.status(200).json({mensagem: "transação feita com sucesso"});
                    return;
                }else{
                    resp.status(400).json({mensagem: "saldo insuficiente"});
                    return;
                }
            }else{
                resp.status(400).json({mensagem: "senha invalida"});
                return;
            }
           
        }
    }
     
}

 function saldo(req, resp){
     let senhaNumber = Number(req.query.senha);
     let contaNumber = Number(req.query.numero_conta);
     

     if(contaNumber && senhaNumber){
        const achandoConta = contas.find(item => item.numero === contaNumber)

         if(!achandoConta){
            resp.status(400).json({mensagem: "conta não existe"});
            return;
        }
     
        if(achandoConta.numero !== contaNumber && achandoConta.usuario.senha !== senhaNumber){
           
            resp.status(400).json({mensagem: "o numero da conta ou da senha não existe"});
        }else{
            resp.status(200).json({saldo: achandoConta.saldo});
        }
    }else{
        resp.status(400).json({mensagem: "numero da conta ou senha da invalido"});
    }
}

 function extrato( req, resp){
    let senhaNumber = Number(req.query.senha);
    let contaNumber = Number(req.query.numero_conta);
    

    if(contaNumber && senhaNumber){
       const achandoConta = contas.find(item => item.numero === contaNumber)
    
       if(achandoConta.numero !== contaNumber && achandoConta.usuario.senha !== senhaNumber){
         
            resp.status(400).json({mensagem: "o numero da conta ou da senha não existe"});
           
       }else{

            const depositosConta = bancodedados.depositos.filter(deposito => deposito.numero_conta === contaNumber);
            const saquesConta = bancodedados.saques.filter(saque => saque.numero_conta === contaNumber);
            const transferenciasEnviadas = bancodedados.transferencias.filter(transfer => transfer.numero_conta_origem === contaNumber);
            const transferenciasRecebidas = bancodedados.transferencias.filter(transfer => transfer.numero_conta_destino === contaNumber);

            const extrato = 
                {
                    saques: saquesConta,
                    depositos: depositosConta,
                    transferenciasEnviadas: transferenciasEnviadas,
                    transferenciasRecebidas: transferenciasRecebidas,
                }
            

           contas.push(extrato)
           console.log(extrato)
        
           resp.status(200).json(extrato);

        }
   }else{
       resp.status(400).json({mensagem: "numero da conta ou senha da invalido"});
   }
}

 module.exports = {
     listarContas,
     criarConta,
     atualizarUsuarioConta,
     deletarConta,
     deposito,
     sacar,
     transferir,
     saldo,
     extrato

}
