const html = document.querySelector('html')
const focoBt = document.querySelector('.app__card-button--foco')
const curtoBt = document.querySelector('.app__card-button--curto')
const longoBt = document.querySelector('.app__card-button--longo')
const banner = document.querySelector('.app__image')
const titulo = document.querySelector('.app__title')
const botoes = document.querySelectorAll('.app__card-button')
const musicaFocoInput = document.querySelector('#alternar-musica')
const musica = new Audio('sons/luna-rise-part-one.mp3')
const iniciarOuPausarBt = document.querySelector('#start-pause span')
const startPauseBt = document.querySelector('#start-pause')
const iconeIniciarOuPausarBt = document.querySelector('.app__card-primary-butto-icon')
const tempoNaTela = document.querySelector('#timer')

const audioPlay = new Audio('/sons/play.wav')
const audioPausa = new Audio('/sons/pause.mp3')
const audioTempoFinalizado = new Audio('./sons/beep.mp3')

let tempoDecorridoEmSegundos = 1500
let intervaloId = null

musica.loop = true

// Inputs e botão para configurar tempos
const inputTempoFoco = document.getElementById('input-tempo-foco')
const inputTempoCurto = document.getElementById('input-tempo-curto')
const inputTempoLongo = document.getElementById('input-tempo-longo')
const btnSalvarTempos = document.getElementById('btn-salvar-tempos')

// Função para carregar tempos do localStorage ou usar padrão
function carregarTempos() {
  const foco = localStorage.getItem('tempoFoco') || 25
  const curto = localStorage.getItem('tempoCurto') || 5
  const longo = localStorage.getItem('tempoLongo') || 15

  inputTempoFoco.value = foco
  inputTempoCurto.value = curto
  inputTempoLongo.value = longo

  return {
    foco: Number(foco) * 60,
    curto: Number(curto) * 60,
    longo: Number(longo) * 60
  }
}

let tempos = carregarTempos()

function mostrarTempo() {
  const tempo = new Date(tempoDecorridoEmSegundos * 1000)
  const tempoFormatado = tempo.toLocaleTimeString('pt-Br', {minute: '2-digit', second: '2-digit'})
  tempoNaTela.innerHTML = `${tempoFormatado}`
}

function alterarContexto(contexto) {
  mostrarTempo()
  botoes.forEach(function (botao) {
    botao.classList.remove('active')
  })
  html.setAttribute('data-contexto', contexto)
  banner.setAttribute('src', `/imagens/${contexto}.png`)

  switch (contexto) {
    case "foco":
      titulo.innerHTML = `
      Otimize sua produtividade,<br>
          <strong class="app__title-strong">mergulhe no que importa.</strong>
      `
      break;
    case "descanso-curto":
      titulo.innerHTML = `
      Que tal dar uma respirada? <strong class="app__title-strong">Faça uma pausa curta!</strong>
      ` 
      break;
    case "descanso-longo":
      titulo.innerHTML = `
      Hora de voltar à superfície.<strong class="app__title-strong"> Faça uma pausa longa.</strong>
      `
      break;
    default:
      break;
  }
}

// Atualiza o tempoDecorridoEmSegundos conforme o contexto e tempos configurados
function atualizarTempoPorContexto(contexto) {
  switch(contexto) {
    case 'foco':
      tempoDecorridoEmSegundos = tempos.foco
      break
    case 'descanso-curto':
      tempoDecorridoEmSegundos = tempos.curto
      break
    case 'descanso-longo':
      tempoDecorridoEmSegundos = tempos.longo
      break
  }
  mostrarTempo()
}

const contagemRegressiva = () => {
  if(tempoDecorridoEmSegundos <= 0) {
    audioTempoFinalizado.play()  
    alert('Tempo finalizado')
    const focoAtivo = html.getAttribute('data-contexto') == 'foco'
    if (focoAtivo) {
      const evento = new CustomEvent('FocoFinalizado')
      document.dispatchEvent(evento)
    }
    zerar()
    return
  }
  tempoDecorridoEmSegundos -= 1
  mostrarTempo()
}

startPauseBt.addEventListener('click', iniciarOuPausar)

function iniciarOuPausar() {
  if (intervaloId) {
    audioPausa.play()  
    zerar()
    return 
  }
  audioPlay.play()  
  intervaloId = setInterval(contagemRegressiva, 1000)
  iniciarOuPausarBt.textContent = "Pausar"
  iconeIniciarOuPausarBt.setAttribute('src', `/imagens/pause.png` )
}

function zerar() {
  clearInterval(intervaloId) 
  iniciarOuPausarBt.textContent = "Começar"
  iconeIniciarOuPausarBt.setAttribute('src', `/imagens/play_arrow.png` )
  intervaloId = null
}

musicaFocoInput.addEventListener('change', () => {
  if(musica.paused) {
    musica.play()
  } else {
    musica.pause()
  }
})

focoBt.addEventListener('click', () => {
  atualizarTempoPorContexto('foco')
  alterarContexto('foco')
  focoBt.classList.add('active')
})

curtoBt.addEventListener('click' , () => {
  atualizarTempoPorContexto('descanso-curto')
  alterarContexto('descanso-curto')
  curtoBt.classList.add('active')
})

longoBt.addEventListener('click' , () => {
  atualizarTempoPorContexto('descanso-longo')
  alterarContexto('descanso-longo')
  longoBt.classList.add('active')
})

// Salvar tempos personalizados
btnSalvarTempos.addEventListener('click', () => {
  const foco = Number(inputTempoFoco.value)
  const curto = Number(inputTempoCurto.value)
  const longo = Number(inputTempoLongo.value)

  if (foco < 1 || curto < 1 || longo < 1) {
    alert('Por favor, insira valores válidos maiores que zero.')
    return
  }

  localStorage.setItem('tempoFoco', foco)
  localStorage.setItem('tempoCurto', curto)
  localStorage.setItem('tempoLongo', longo)

  tempos = {
    foco: foco * 60,
    curto: curto * 60,
    longo: longo * 60
  }

  // Atualiza o timer para o contexto atual com o novo tempo
  const contextoAtual = html.getAttribute('data-contexto')
  atualizarTempoPorContexto(contextoAtual)

  alert('Tempos salvos com sucesso!')
})

mostrarTempo()