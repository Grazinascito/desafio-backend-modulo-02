
function validarConta(conta){
   
    if(!conta.nome){
        return "O campo 'nome' é obrigatório";
    }

    if(!conta.cpf){
        return "O campo 'cpf' é obrigatório";
    }

    if(!conta.data_nascimento){
        return "O campo 'data_Nascimento' é obrigatório";
    }

    if(!conta.telefone){
        return "O campo 'telefone' é obrigatório";
    }

    if(!conta.email){
        return "O campo 'email' é obrigatórioo";
    }

    if(!conta.senha){
        return  "O campo 'senha' é obrigatório";
    }

 }

 function validarTransfer(erro){
    if(!erro.numero_conta_origem){
        
        return "conta de origem precisa ser informada"
    }
    if(!erro.numero_conta_destino){
       
        return "conta de destino precisa ser informada"
    }
    if(!erro.valor){
         
        return "valor precisa ser informado"
    }
    if(!erro.senha){
       
        return  "senha precisa ser informada"
    }
 }

module.exports = { validarConta, validarTransfer};