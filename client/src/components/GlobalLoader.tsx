// client/src/components/GlobalLoader.tsx

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-purple-950/30 to-transparent opacity-60 animate-pulse-slow-bg" />

      <div className="relative z-10 flex flex-col items-center gap-10 md:gap-12">
       
        <div className="relative flex items-center justify-center">
          
          <img
            src="/icon-logo.png"
            alt="TISA Logo"
            className="
              w-40 h-auto max-h-40 md:w-56 md:max-h-56 
              object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.6)] 
              animate-pulse-slow z-10
            "
          />

          <div className="absolute inset-[-40px] md:inset-[-50px] flex items-center justify-center pointer-events-none">
            <div
              className="
                w-[200px] h-[200px] md:w-[280px] md:h-[280px]
                border-[8px] md:border-[10px]
                border-t-cyan-400 border-r-purple-500
                border-b-transparent border-l-transparent
                rounded-full
                animate-spin
                shadow-[0_0_50px_rgba(6,182,212,0.5),0_0_80px_rgba(168,85,247,0.3)]
              "
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent tracking-widest animate-pulse-text">
            INITIALIZING SYSTEM...
          </h2>
          <p className="mt-3 text-gray-300 text-base md:text-lg opacity-90">
            Preparing your learning experience
          </p>
        </div>
      </div>
    </div>
  );
}
