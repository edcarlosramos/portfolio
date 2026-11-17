// Sinais compartilhados entre a tela de carregamento e o resto do site.
//
// - `heroReady`: o hero terminou o trabalho pesado de preparo (ex.: máscara e
//   shader do GlassTextGL). A tela de carregamento espera por ele, assim esse
//   custo acontece com a tela ainda cobrindo tudo, e não durante a transição.
// - `introDone`: a tela de carregamento começou a sair (ou nem apareceu). Loops
//   contínuos que não precisam rodar escondidos (ex.: render por quadro do
//   WebGL) só começam depois dele.
//
// Ambos são promessas resolvidas uma única vez (idempotentes, o que importa no
// StrictMode, que monta os efeitos duas vezes).

const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const hero = deferred()
const intro = deferred()

export const heroReady = hero.promise
export const markHeroReady = () => hero.resolve()

export const introDone = intro.promise
export const markIntroDone = () => intro.resolve()
