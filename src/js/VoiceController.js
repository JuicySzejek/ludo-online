class VoiceController {
    
    constructor () {
        this.speech = window.speechSynthesis
        console.log(this.speech)
        const interval = setInterval(() => {
            if (this.speech.getVoices().length !== 0) {
                this.voice = this.speech.getVoices()[0]
                clearInterval(interval)
            }
        }, 500)
    }

    speak (word) {
        const sentence = new SpeechSynthesisUtterance(word)
        sentence.voice = this.voice
        this.speech.speak(sentence)
    }
}