import {$, $$, createElement} from './helpers.js';
import { START_METHOD } from './constants.js';
import { startAudio } from './audio-analyzer.js';

const main = document.getElementsByTagName('main')[0];

const p = createElement('p', {class: 'test'}, 'It works!');
const div = createElement('div', {id: 'test'}, [p]);

const userIcon = createElement('div', {id: 'player1', class: 'player-icon'});

export const startGame = () => {
	document.removeEventListener(START_METHOD, startGame);
	main.innerHTML = '';
	main.appendChild(userIcon);

	startAudio(true);
};
