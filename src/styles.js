const styles = {
  boxWidth: "xl:max-w-[1280px] w-full",

  heading2: "font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full",
  huggetitle: "font-sans font-semibold text-[300px] tracking-[-0.02em] leading-none",
  jobtitle: "font-sans font-medium text-[40px] tracking-[-0.02em] leading-none",
  fadetitle: "bg-linear-to-b from-[#FFFFFF] from-[28%] to-[#C3F2FF] to-[81%] bg-clip-text text-transparent drop-shadow-[3px_4px_20px_rgba(255,255,255,0.15)]",

  container: "w-full max-w-[1440px] mx-auto px-[clamp(20px,7vw,100px)]",
  sectionY: "py-[clamp(48px,7vw,96px)]",
  sectionTitle: "font-sans font-semibold tracking-[-0.02em] leading-none text-dim-navy text-[clamp(32px,4.4vw,60px)]",
  sectionLink: "cursor-pointer font-sans font-semibold tracking-[-0.01em] text-dim-navy text-[clamp(16px,2.1vw,30px)]",
  focusRing: "outline-none focus-visible:ring-2 focus-visible:ring-dim-bluestrong focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",

  flexCenter: "flex justify-center items-center",
  flexStart: "flex justify-center items-start",

  paddingX: "sm:px-16 px-6",
  paddingY: "sm:py-16 py-6",
  padding: "sm:px-16 px-6 sm:py-12 py-4",

  marginX: "sm:mx-16 mx-6",
  marginY: "sm:my-16 my-6",
};

export const layout = {
  section: `flex md:flex-row flex-col ${styles.paddingY}`,
  sectionReverse: `flex md:flex-row flex-col-reverse ${styles.paddingY}`,

  sectionImgReverse: `flex-1 flex ${styles.flexCenter} md:mr-10 mr-0 md:mt-0 mt-10 relative`,
  sectionImg: `flex-1 flex ${styles.flexCenter} md:ml-10 ml-0 md:mt-0 mt-10 relative`,

  sectionInfo: `flex-1 ${styles.flexStart} flex-col`,
};

export default styles;