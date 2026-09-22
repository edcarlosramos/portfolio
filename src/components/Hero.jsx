import React from 'react'
import styles from '../styles'

const Hero = () => {
  return (
    <div className=" flex w-full h-[900px] justify-center bg-linear-to-t from-bg-trasnaparent from-0% to-hugeblack-bg to-25%">
        <div className=" flex w-[1345px] h-[838px] rounded-4xl justify-starter m-[15px] items-center
        bg-linear-to-t from-hugeblack-bg from-0% to-blueton-bg to-100% shadow-inner-light ">
            <div className ="flex-col">
                <h1 className ={`${styles.huggetitle} ${styles.fadetitle} inline-block pr-6 h-fit`}>
                Edcarlos
                </h1>
                    <div className ="flex flex-row ml-[15px]">
                        <div className="inline-block p-3.5 h-fit p rounded-3xl
                        bg-linear-to-r from-dim-bluestrong/25 from-0% to-dim-turk/25 to-100% backdrop-blur-3xl
                        shadow-inner-lightcard drop-shadow-[3px_4px_5px_rgba(255,255,255,0.15)]">
                            <h1 className = {`${styles.jobtitle} text-dim-white`}>
                                Analista de Dados
                            </h1>
                        </div>
                        <h1 className ={`${styles.huggetitle} text-dim-white/20 inline-block pr-6 h-fit `}>
                        Ramos.
                        </h1>
                    </div>
                </div>
        </div>
    </div>
  )
}

export default Hero