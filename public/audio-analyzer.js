import { createElement, $id } from './helpers.js';
import { PEAK_SPACING, PERCUSSION_THRESHOLD } from './constants.js';

window.stopDebug = false;

export const startAudio = debug => {
	const audioCtx = new AudioContext();
	const analyzer = audioCtx.createAnalyser();
	analyzer.minDecibels = -90;
	analyzer.maxDecibels = -10;
	analyzer.smoothingTimeConstant = 0.85;

	let source;
	// debug vars
	const frequencyData = {};
	let visualize, canvas, canvasCtx;

	if (debug) {
		const canvas = createElement('canvas', { id: 'visualizer' });
		const canvasCtx = canvas.getContext('2d');
		const debugEl = $id('debug');
		debugEl.appendChild(canvas);
		debugEl.style.display = 'block';

		visualize = source => {
			const { width, height } = canvas;
			canvasCtx.clearRect(0, 0, width, height);

			source.connect(analyzer);

			analyzer.fftSize = 2048;
			const bufferLength = analyzer.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			frequencyData.sampleRate = audioCtx.sampleRate;
			frequencyData.arrayLen = bufferLength;
			frequencyData.maxFrequency = audioCtx.sampleRate / 2;
			const frequencyInterval = frequencyData.maxFrequency / bufferLength;
			// frequency in Hz
			frequencyData.rateValues = new Array(bufferLength);
			for (let rv = 0; rv < bufferLength; rv++) {
				frequencyData.rateValues[rv] = frequencyInterval * (rv + 1);
			}

			/* findPeaks: helps find notes that are picked up by microphone
			 * @param stream (Object): Audio MediaStreamSource
			 * @returns (Array): indices of audio peaks in a given sample
			**/
			const findPeaks = stream => {
				const peaks = [];
				const lastPeak = {pos: -1, val: 0};
				const dataLen = stream.length;
				for (let i = 0; i < dataLen; i++) {
					const decibel = stream[i];
					const isGTPrev = i === 0 || decibel > stream[i - 1];
					const isGTNext = i === dataLen - 1 || decibel > stream[i + 1];
					const isFarFromLP = lastPeak.pos === -1
						|| Math.abs(i - lastPeak.pos) >= PEAK_SPACING ;
					const isGTLP = !lastPeak.val || (decibel > lastPeak.val);

					if (!isFarFromLP && isGTLP) {
						peaks.splice(peaks.indexOf(lastPeak.pos), 1);
					}
					if (isGTPrev && isGTNext && (isFarFromLP || isGTLP)) {
						peaks.push(i); // frequencyData.rateValues[i]);
						lastPeak.pos = i;
						lastPeak.val = decibel;
					}
				}

				return peaks;
			}; // end findPeaks

			/* findPercussion: recognize when a percussive sound begins
			 * @param stream (Object): Audio MediaStreamSource
			 * @returns (Boolean) whether the given sample is the start of percussion
			**/
			const findPercusion = stream => {
				const isPerscussive = false;

				// Oh man, this should be a method on a Class.
			}; // end findPercussion

			const drawBars = () => {
				if (stopDebug) return;
				const drawVisual = requestAnimationFrame(drawBars);
				analyzer.getByteFrequencyData(dataArray);
				const peaks = findPeaks(dataArray);

				canvasCtx.fillStyle = 'rgb(255,255,255)';
				canvasCtx.fillRect(0,0,width,height);

				const barWidth = (width / bufferLength) * 2.5;
				let barHeight;
				let x = 0;
				for (let i = 0; i < bufferLength; i++) {
					barHeight = dataArray[i];
					const isPeak = peaks.includes(i);

					canvasCtx.fillStyle = isPeak
						?	'rgb(0,200,0)'
						: `rgb(${barHeight + 100},50,50)`;
					canvasCtx.fillRect(
						x,
						height - barHeight / 2,
						barWidth,
						barHeight / 2
					);

					x += barWidth + 1;
				}
			}; // end drawBars

			drawBars();
		}; // end vis
	}

	navigator.mediaDevices.
		getUserMedia({ audio: true })
		.then(stream => {
			source = audioCtx.createMediaStreamSource(stream);
			if (debug) visualize(source);
		})
		.catch(error => {
			console.error('Error in GUM:', error);
		});
};
