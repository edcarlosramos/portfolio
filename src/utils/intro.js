// Sinais compartilhados entre a revelação de entrada (PageIntro.jsx) e o
// resto do site.
//
// - `heroPrepare`: libera o trabalho pesado do hero (máscara e shader do
//   GlassTextGL). Disparado na montagem.
// - `heroReady`: o hero terminou esse preparo. A revelação espera por ele
//   (com teto curto), para o "Ramos." não surgir depois dos outros itens.
// - `introDone`: a revelação começou (ou nem acontece: movimento reduzido).
// - `introEnd`: a revelação terminou. Loops contínuos do hero (render por
//   quadro do WebGL, movimento dos blobs) só começam aqui: durante a entrada
//   o card só se move inteiro, e com o conteúdo parado a GPU reaproveita o
//   que já desenhou em vez de refazer tudo a cada quadro.
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

