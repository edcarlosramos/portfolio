// Sinais compartilhados entre a tela de carregamento e o resto do site.
//
// - `heroPrepare`: a tela de carregamento chegou ao fim do contador (parada no
//   "100") e libera o trabalho pesado do hero (ex.: máscara e shader do
//   GlassTextGL). Um travamento com a tela parada é invisível; durante a
//   contagem, não.
// - `heroReady`: o hero terminou esse preparo. A tela espera por ele antes de
//   sair, assim o custo não cai na transição.
// - `introDone`: a tela de carregamento começou a sair (ou nem apareceu).
// - `introEnd`: a saída terminou (ou a tela nem apareceu). Loops contínuos do
//   hero (render por quadro do WebGL, movimento dos blobs) só começam aqui:
//   durante a revelação o card só se move inteiro, e com o conteúdo parado a
//   GPU reaproveita o que já desenhou em vez de refazer tudo a cada quadro.
//
// Todas são promessas resolvidas uma única vez (idempotentes, o que importa no
// StrictMode, que monta os efeitos duas vezes).

const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const prepare = deferred()
const hero = deferred()
const intro = deferred()

export const heroPrepare = prepare.promise
export const markHeroPrepare = () => prepare.resolve()

export const heroReady = hero.promise
export const markHeroReady = () => hero.resolve()

export const introDone = intro.promise
export const markIntroDone = () => intro.resolve()

const end = deferred()
export const introEnd = end.promise
export const markIntroEnd = () => end.resolve()

// Classe no <html> (posta já no index.html) enquanto a tela de carregamento
// cobre o site: as seções abaixo do hero ficam com `content-visibility:
// hidden`, então o navegador não calcula o layout delas a cada mudança (ex.:
// quando a fonte chega). Ela sai uma vez só, com o contador parado no 100.
export const LOADING_CLASS = 'is-loading'
export const endLoadingLayout = () => document.documentElement.classList.remove(LOADING_CLASS)
