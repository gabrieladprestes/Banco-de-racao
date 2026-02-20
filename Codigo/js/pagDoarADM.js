function mudar(){
    let produtoSelecionado = document.getElementById('produto').value
    let pesoInput = document.getElementById('pesoInput')

    if (produtoSelecionado === 'racao')
        pesoInput.style = 'display: inline'
    else if (produtoSelecionado != 'racao')
        pesoInput.style = 'display: none'
}