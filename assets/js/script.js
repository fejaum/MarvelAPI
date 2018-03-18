let buscaNome = document.querySelector("#buscaNome"),
    popup = document.querySelector(".popup"),
    configPersonagem = {
        publicKey: 'e796232e3bd263d95c4b38c8088b053d',
        url: 'http://gateway.marvel.com/v1/public/characters',
        maxResultado: 0,
        numeroPaginas: 0,
        paginaInicial: 0,
        listagemEventosSeries: 3,
        qtdPorPagina: 4,
        buscaNome: null,
        botoesPaginacao: null,
        prevDisabled: '',
        nextDisabled: ''
}

function buscaPersonagem() {

    let nameStartsWith = '',
        offset = '',
        limit = '';

    if (configPersonagem.buscaNome)
        nameStartsWith = '&nameStartsWith=' + configPersonagem.buscaNome;

    if (configPersonagem.paginaInicial) {
        offset = (configPersonagem.paginaInicial >= 1) ? (configPersonagem.paginaInicial * configPersonagem.qtdPorPagina) : 0;
        offset = '&offset=' + offset;
    }

    if (configPersonagem.qtdPorPagina)
        limit = '&limit=' + configPersonagem.qtdPorPagina;

    reqAPI(configPersonagem.url + '?apikey=' + configPersonagem.publicKey + '' + nameStartsWith + '' + offset + '' + limit, montaLista);

}

function montaLista(data, params) {

    let tabelaResultado = document.querySelector(".tabela-resultado");

    if (data) {

        let innerHTML = `
                <header class="row">
                    <div class="col">Nome</div>
                    <div class="col">Séries</div>
                    <div class="col">Eventos</div>
                </header>`,
            personagens = data.data.results;

        for (let i = 0; i < personagens.length; i++) {

            let personagem = personagens[i],
                avatar = '',
                series = '',
                eventos = '';

            if (personagem.thumbnail)
                avatar = `<figure><img src="${personagens[i].thumbnail.path}.${personagens[i].thumbnail.extension}" title="${personagem.name}" alt="${personagem.name}" class="avatar" /></figure>`;

            if (personagem.series) {
                series = `<ul>`;                
                for (let x = 0, len = (personagem.series.items.length > configPersonagem.listagemEventosSeries) ? configPersonagem.listagemEventosSeries : personagem.series.items.length; x < len; x++) {
                    series = series + `<li class='lista'>${personagem.series.items[x].name}</li>`
                }
                series = series + `</ul>`;
            }

            if (personagem.events) {
                eventos = `<ul>`;
                for (let x = 0, len = (personagem.events.items.length > configPersonagem.listagemEventosSeries) ? configPersonagem.listagemEventosSeries : personagem.events.items.length; x < len; x++) {
                    eventos = eventos + `<li class='lista'>${personagem.events.items[x].name}</li>`
                }
                eventos = eventos + `</ul>`;
            }

            innerHTML = innerHTML + `
            <section class="row" data-id='${personagem.id}'>
                <div class="col">
                    ${avatar}
                    <p>${personagem.name}</p>
                </div>
                <div class="col">
                    ${series}
                </div>
                <div class="col">
                    ${eventos}
                </div>
            </section>`;
        }

        configPersonagem.maxResultado = data.data.total - data.data.offset;

        tabelaResultado.innerHTML = innerHTML + montaPaginacao();
        
        let sectionLinks = document.querySelectorAll('section.row');

        for (let i = 0; i < sectionLinks.length; ++i) {
            sectionLinks[i].onclick = function() {
                pegaDetalhes(sectionLinks[i].getAttribute("data-id"));
            }
        }

    } else {
        tabelaResultado.innerHTML = "<h3 class='mensagem-erro'>Não foi possível realizar a busca, tente mais tarde novamente.</h2>";
    }
}

function paginacao(acao, pagina) {

    switch (acao) {
        case "next":
            if ( (configPersonagem.paginaInicial + 1) <= configPersonagem.numeroPaginas )
                ++configPersonagem.paginaInicial;
            break;
         
        case "prev":
            if ( (configPersonagem.paginaInicial - 1) >= 0 )
                 --configPersonagem.paginaInicial;
            break;
        
        case "goto":
            configPersonagem.paginaInicial = pagina;
            break;
        
        default:
            break;
    }

    buscaPersonagem();
}

function montaPaginacao() {

    configPersonagem.numeroPaginas = Math.ceil( configPersonagem.maxResultado / configPersonagem.qtdPorPagina );
    
	function botoesPaginacao() {
		let i, botao = "";
		for( i = (configPersonagem.numeroPaginas < 3 && configPersonagem.paginaInicial == 0) ? 0 : configPersonagem.paginaInicial, len = (configPersonagem.numeroPaginas > 3) ? configPersonagem.paginaInicial + 3 : configPersonagem.paginaInicial + configPersonagem.numeroPaginas; i < len; i++ ) {
            let ativo = (i == (configPersonagem.paginaInicial)) ? 'ativo' : '',
            label = i + 1;
            botao = botao +  `<button onclick="paginacao('goto', ${i})"class="paginacao-pagina ${ativo}">${label}</button>`;
		}
		return botao;
    }
    
    configPersonagem.botoesPaginacao = botoesPaginacao();

    configPersonagem.prevDisabled = '';
    if (configPersonagem.paginaInicial == 0)
        configPersonagem.prevDisabled = 'disabled';

    configPersonagem.nextDisabled = '';
    if (configPersonagem.numeroPaginas <= 3)
        configPersonagem.nextDisabled = 'disabled';

    return `
    <footer class="row">
        <div class="col">
            <div class="paginacao">
                <button onclick="paginacao('prev')" class="paginacao-esquerda" ${configPersonagem.prevDisabled}>◄</button>
                ${configPersonagem.botoesPaginacao}
                <button onclick="paginacao('next')" class="paginacao-direita" ${configPersonagem.nextDisabled}>►</button>
            </div>
        </div>
    </footer>`;
}


function pegaDetalhes(id) {
    if (id) {
        reqAPI(configPersonagem.url + '/' + id + '?apikey=' + configPersonagem.publicKey, abrirDetalhes);
    }
}

function abrirDetalhes(data, params) {
    if (data) {
        let personagem = data.data.results[0],
            imagem;
        if (personagem.thumbnail)
            imagem = `<img src="${personagem.thumbnail.path}.${personagem.thumbnail.extension}" alt="${personagem.name}" title="${personagem.name}" />`
        let innerHTML = `
            <div class="popup-container">
                <figure class="thumbnail">
                    ${imagem}
                    <figcaption>${personagem.name}</figcaption>
                </figure>
                <div class="informacoes">
                    <div class="eventos"></div>
                    <div class="series"></div>
                </div>
            </div>
            <span class="close" onclick="fecharPopUp()">&times;</span>`;
        popup.innerHTML = innerHTML;
        if (personagem.events.available > 0)
            pegarEventosSeries(personagem.events, 'evento');
        if (personagem.series.available > 0)
            pegarEventosSeries(personagem.series, 'serie');
        abrirPopUp();
    }
}

function pegarEventosSeries(eventosSeries, tipo) {
    if (eventosSeries) {
        for (let i = 0, len = (eventosSeries.available > configPersonagem.listagemEventosSeries) ? configPersonagem.listagemEventosSeries : eventosSeries.available; i < len; i++) {
            reqAPI(eventosSeries.items[i].resourceURI + '?apikey=' + configPersonagem.publicKey, montarEventosSeries, { tipo: tipo })
        }
    }
}

function montarEventosSeries(data, params) {
    if (data) {
        let eventoSerie = data.data.results[0],
            innerHTML = `
                <div class="${params.tipo}">
                    <a href="${eventoSerie.urls[0].url}">
                        <figure>
                            <img src="${eventoSerie.thumbnail.path}.${eventoSerie.thumbnail.extension}" title="${eventoSerie.title}" alt="${eventoSerie.title}" />
                            <figcaption>${eventoSerie.title}</figcaption>
                            <span class="personagens">Personagens: ${eventoSerie.characters.available}</span>
                            <span class="quadrinhos">Quadrinhos: ${eventoSerie.comics.available}</span>
                            <span class="criadores">Criadores: ${eventoSerie.creators.available}</span>
                        </figure>
                    </a>
                </div>`;
        console.log(eventoSerie);
        document.querySelector("." + params.tipo + "s").innerHTML = document.querySelector("." + params.tipo + "s").innerHTML + innerHTML;
    }
}

function reqAPI(url, callback, params) {
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            if (data && data.code == 200)
                callback(data, params);
        } else
            callback();
    }
    req.onerror = function() {
        callback();
    };    
    req.send();
}

function abrirPopUp() {
    popup.style.display = "block";
}

function fecharPopUp() {
    popup.style.display = "none";
}

if (buscaNome) {

    buscaNome.onkeyup = function() {
        configPersonagem.buscaNome = buscaNome.value;
        configPersonagem.paginaInicial = 0;
        buscaPersonagem();
    };

}

buscaPersonagem();