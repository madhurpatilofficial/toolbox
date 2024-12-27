import { Component } from '@angular/core';

@Component({
  selector: 'app-string-manipulator',
  templateUrl: './string-manipulator.component.html',
  styleUrls: ['./string-manipulator.component.css'],
})
export class StringManipulatorComponent {
  inputString: string = '';
  resultString: string = '';
  replaceFrom: string = '';
  replaceTo: string = '';
  insertSubstring: string = '';
  insertPosition: number = 0;
  insertContent: string = '';
  showReplaceInputs: boolean = false;
  showInsertInputs: boolean = false;
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;

  isBlinking: boolean = true;

  toggleBlink() {
    this.isBlinking = !this.isBlinking;
  }

  ngOnInit() {
    this.populateVoiceList();
    if (
      typeof speechSynthesis !== 'undefined' &&
      speechSynthesis.onvoiceschanged !== undefined
    ) {
      speechSynthesis.onvoiceschanged = this.populateVoiceList.bind(this);
    }
  }

  populateVoiceList() {
    if (typeof speechSynthesis === 'undefined') {
      return;
    }

    this.voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');

    if (voiceSelect) {
      voiceSelect.innerHTML = ''; // Clear existing options

      for (let i = 0; i < this.voices.length; i++) {
        const option = document.createElement('option');
        option.textContent = `${this.voices[i].name} (${this.voices[i].lang})`;

        if (this.voices[i].default) {
          option.textContent += ' — DEFAULT';
        }

        option.setAttribute('data-lang', this.voices[i].lang);
        option.setAttribute('data-name', this.voices[i].name);
        voiceSelect.appendChild(option);
      }
    }
  }

  readTextAloud() {
    if (!this.inputString) return;

    const msg = new SpeechSynthesisUtterance(this.inputString);
    const selectedVoiceName = (
      document.getElementById('voiceSelect') as HTMLSelectElement
    )?.selectedOptions[0]?.getAttribute('data-name');

    if (selectedVoiceName) {
      const selectedVoice = this.voices.find(
        (voice) => voice.name === selectedVoiceName
      );
      if (selectedVoice) {
        msg.voice = selectedVoice;
      }
    }

    window.speechSynthesis.speak(msg);
  }

  stopTextAloud() {
    window.speechSynthesis.cancel();
  }

  // Function to remove spaces from input string
  removeSpaces() {
    this.resultString = this.inputString.replace(/\s/g, '');
  }
  // Function to convert input string to uppercase
  toUpperCase() {
    this.resultString = this.inputString.toUpperCase();
  }

  // Function to convert input string to lowercase
  toLowerCase() {
    this.resultString = this.inputString.toLowerCase();
  }

  // Function to reverse the input string
  reverseString() {
    this.resultString = this.inputString.split('').reverse().join('');
  }

  // Function to reverse the words in the input string
  reverseWords() {
    this.resultString = this.inputString.split(' ').reverse().join(' ');
  }

  // Function to count the number of words in the input string
  countWords() {
    const words = this.inputString.match(/\b\w+\b/g);
    this.resultString = words ? words.length.toString() : '0';
  }

  // Function to clear both input and result strings
  clear() {
    this.inputString = '';
    this.resultString = '';
    this.resetInputs();
  }

  // Function to capitalize the first letter of each word in the input string
  capitalizeWords() {
    this.resultString = this.inputString.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
  }

  // Function to toggle the case of each character in the input string
  toggleCase() {
    this.resultString = this.inputString.replace(/./g, (char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    );
  }

  // Function to remove duplicate characters from the input string
  removeDuplicates() {
    this.resultString = Array.from(new Set(this.inputString.split(''))).join(
      ''
    );
  }

  // Function to sort characters in the input string alphabetically
  sortCharacters() {
    this.resultString = this.inputString.split('').sort().join('');
  }

  // Function to encode the input string in Base64 format
  encodeBase64() {
    this.resultString = btoa(this.inputString);
  }

  // Function to decode Base64 encoded string back to normal text
  decodeBase64() {
    this.resultString = atob(this.inputString);
  }

  // Function to convert input string to camel case
  toCamelCase() {
    this.resultString = this.inputString.replace(/\W+(.)/g, (match, chr) =>
      chr.toUpperCase()
    );
  }

  // Function to truncate the input string to a specified length
  truncateString(length: number) {
    if (this.inputString.length > length) {
      this.resultString = this.inputString.substring(0, length) + '...';
    } else {
      this.resultString = this.inputString;
    }
  }

  // Function to convert the input string to title case
  toTitleCase() {
    this.resultString = this.inputString
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Function to check if input string is a palindrome
  checkPalindrome() {
    if (this.inputString) {
      const original = this.inputString.toLowerCase().replace(/[\W_]/g, '');
      const reversed = original.split('').reverse().join('');
      this.resultString =
        original === reversed ? 'Palindrome' : 'Not a Palindrome';
    }
  }
  // Function to replace occurrences of a substring in the input string
  replaceSubstring() {
    this.resultString = this.inputString.replace(
      new RegExp(this.replaceFrom, 'g'),
      this.replaceTo
    );
    this.resetInputs(); // Hide inputs after replacing
  }

  // Function to convert input string to kebab case
  toKebabCase() {
    this.resultString = this.inputString.replace(/\W+/g, '-').toLowerCase();
  }

  // Function to convert input string to snake case
  toSnakeCase() {
    this.resultString = this.inputString.replace(/\W+/g, '_').toLowerCase();
  }

  // Function to convert input string to Pascal case
  toPascalCase() {
    this.resultString = this.inputString
      .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .replace(/\W/g, '');
  }

  // Function to count characters excluding spaces
  countCharactersExcludingSpaces() {
    this.resultString = this.inputString.replace(/\s/g, '').length.toString();
  }

  // Function to count vowels
  countVowels() {
    const match = this.inputString.match(/[aeiou]/gi);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to count consonants
  countConsonants() {
    const match = this.inputString.match(/[^aeiou\s\d]/gi);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to remove punctuation from input string
  removePunctuation() {
    this.resultString = this.inputString.replace(/[^\w\s]|_/g, '');
  }

  // Function to convert input string to hexadecimal
  toHexadecimal() {
    this.resultString = this.inputString
      .split('')
      .map((c) => c.charCodeAt(0).toString(16))
      .join(' ');
  }

  // Function to convert hexadecimal to string
  fromHexadecimal() {
    this.resultString = this.inputString
      .split(' ')
      .map((h) => String.fromCharCode(parseInt(h, 16)))
      .join('');
  }

  // Function to scramble input string
  scrambleString() {
    this.resultString = this.inputString
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  // Function to generate acronym from input string
  generateAcronym() {
    this.resultString = this.inputString
      .split(' ')
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  // Function to calculate Levenshtein distance between two strings
  levenshteinDistance() {
    const a = this.inputString;
    const b = this.replaceFrom; // Use replaceFrom for second string

    const matrix = Array.from(Array(a.length + 1), () =>
      Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) {
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) {
          matrix[i][j] = j;
        } else if (j === 0) {
          matrix[i][j] = i;
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
          );
        }
      }
    }

    this.resultString = matrix[a.length][b.length].toString();
  }

  // Function to calculate Jaro-Winkler similarity between two strings
  jaroWinklerSimilarity() {
    const s1 = this.inputString;
    const s2 = this.replaceFrom; // Use replaceFrom for second string

    const m = 0.1;
    const t = 0.1;
    const l = 0.1;

    if (!s1.length || !s2.length) {
      this.resultString = '0';
      return;
    }

    const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;

    const s1Matches = Array(s1.length).fill(false);
    const s2Matches = Array(s2.length).fill(false);

    let matches = 0;
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, s2.length);
      for (let j = start; j < end; j++) {
        if (s2Matches[j]) continue;
        if (s1[i] === s2[j]) {
          s1Matches[i] = true;
          s2Matches[j] = true;
          matches++;
          break;
        }
      }
    }

    if (matches === 0) {
      this.resultString = '0';
      return;
    }

    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s1Matches[i]) {
        for (let j = k; j < s2.length; j++) {
          if (s2Matches[j]) {
            k = j + 1;
            break;
          }
        }
        if (s1[i] !== s2[k - 1]) transpositions++;
      }
    }

    const mPrime = matches / s1.length;
    const nPrime = matches / s2.length;
    const tPrime = (matches - transpositions / 2) / matches;

    const jaroSimilarity = (mPrime + nPrime + tPrime) / 3;
    const prefix = s1.substring(0, 4) === s2.substring(0, 4) ? 4 : 0;

    this.resultString = (jaroSimilarity + prefix * t * (1 - jaroSimilarity))
      .toFixed(2)
      .toString();
  }

  // Function to apply ROT13 encryption
  rot13Encrypt() {
    this.resultString = this.inputString.replace(/[a-zA-Z]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))
    );
  }

  // Function to apply ROT13 decryption
  rot13Decrypt() {
    this.resultString = this.inputString.replace(/[a-zA-Z]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))
    );
  }

  // Function to URL encode the input string
  urlEncode() {
    this.resultString = encodeURIComponent(this.inputString);
  }

  // Function to URL decode the input string
  urlDecode() {
    this.resultString = decodeURIComponent(this.inputString);
  }

  // Function to HTML encode the input string
  htmlEncode() {
    const htmlEntities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    this.resultString = this.inputString.replace(
      /[&<>"']/g,
      (c) => htmlEntities[c] as string
    );
  }

  // Function to HTML decode the input string
  htmlDecode() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      '<!doctype html><body>' + this.inputString,
      'text/html'
    );
    this.resultString = doc.body.textContent || '';
  }

  // Function to count the number of sentences in the input string
  countSentences() {
    const match = this.inputString.match(/[^.!?]+[.!?]+/g);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to remove HTML tags from the input string
  removeHtmlTags() {
    const doc = new DOMParser().parseFromString(this.inputString, 'text/html');
    this.resultString = doc.body.textContent || '';
  }

  // Insert substring
  insertSubString() {
    if (
      this.insertPosition >= 0 &&
      this.insertPosition <= this.inputString.length
    ) {
      this.resultString =
        this.inputString.slice(0, this.insertPosition) +
        this.insertContent +
        ' ' +
        this.inputString.slice(this.insertPosition);
      this.resetInsertInputs();
    } else {
      this.resultString = this.inputString;
    }
  }

  // Reset insert inputs
  resetInsertInputs() {
    this.insertContent = '';
    this.insertPosition = 0;
  }

  // Reset all input fields and flags
  resetInputs() {
    this.showReplaceInputs = false;
    this.showInsertInputs = false;
    this.replaceFrom = '';
    this.replaceTo = '';
    this.insertSubstring = '';
    this.insertPosition = 0;
  }

  // Function to count digits in the input string
  countDigits() {
    const match = this.inputString.match(/\d/g);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to shuffle words in the input string
  shuffleWords() {
    this.resultString = this.inputString
      .split(' ')
      .sort(() => 0.5 - Math.random())
      .join(' ');
  }

  // Function to convert input string to ROT47
  toRot47() {
    this.resultString = this.inputString.replace(/[!-~]/g, (c) =>
      String.fromCharCode(33 + ((c.charCodeAt(0) + 14) % 94))
    );
  }

  // Function to convert ROT47 to normal string
  fromRot47() {
    this.resultString = this.inputString.replace(/[!-~]/g, (c) =>
      String.fromCharCode(33 + ((c.charCodeAt(0) + 47) % 94))
    );
  }

  // Function to count uppercase letters
  countUppercase() {
    const match = this.inputString.match(/[A-Z]/g);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to count lowercase letters
  countLowercase() {
    const match = this.inputString.match(/[a-z]/g);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to convert input string to Morse code
  toMorseCode() {
    const morseCode: { [key: string]: string } = {
      a: '.-',
      b: '-...',
      c: '-.-.',
      d: '-..',
      e: '.',
      f: '..-.',
      g: '--.',
      h: '....',
      i: '..',
      j: '.---',
      k: '-.-',
      l: '.-..',
      m: '--',
      n: '-.',
      o: '---',
      p: '.--.',
      q: '--.-',
      r: '.-.',
      s: '...',
      t: '-',
      u: '..-',
      v: '...-',
      w: '.--',
      x: '-..-',
      y: '-.--',
      z: '--..',
      '1': '.----',
      '2': '..---',
      '3': '...--',
      '4': '....-',
      '5': '.....',
      '6': '-....',
      '7': '--...',
      '8': '---..',
      '9': '----.',
      '0': '-----',
    };
    this.resultString = this.inputString
      .toLowerCase()
      .split('')
      .map((char) => morseCode[char] || char)
      .join(' ');
  }

  // Function to convert Morse code to normal string
  fromMorseCode() {
    const morseCode: { [key: string]: string } = {
      '.-': 'a',
      '-...': 'b',
      '-.-.': 'c',
      '-..': 'd',
      '.': 'e',
      '..-.': 'f',
      '--.': 'g',
      '....': 'h',
      '..': 'i',
      '.---': 'j',
      '-.-': 'k',
      '.-..': 'l',
      '--': 'm',
      '-.': 'n',
      '---': 'o',
      '.--.': 'p',
      '--.-': 'q',
      '.-.': 'r',
      '...': 's',
      '-': 't',
      '..-': 'u',
      '...-': 'v',
      '.--': 'w',
      '-..-': 'x',
      '-.--': 'y',
      '--..': 'z',
      '.----': '1',
      '..---': '2',
      '...--': '3',
      '....-': '4',
      '.....': '5',
      '-....': '6',
      '--...': '7',
      '---..': '8',
      '----.': '9',
      '-----': '0',
    };
    this.resultString = this.inputString
      .split(' ')
      .map((code) => morseCode[code] || code)
      .join('');
  }

  // Function to count unique characters in the input string
  countUniqueCharacters() {
    this.resultString = new Set(this.inputString).size.toString();
  }

  // Function to count a specific character in the input string
  countSpecificCharacter(char: string) {
    const regex = new RegExp(char, 'g');
    const match = this.inputString.match(regex);
    this.resultString = match ? match.length.toString() : '0';
  }

  // Function to check if the input string is an isogram
  checkIsogram() {
    const str = this.inputString.toLowerCase().replace(/[\W_]/g, '');
    this.resultString = str
      .split('')
      .every((char, index, arr) => arr.indexOf(char) === index)
      ? 'Isogram'
      : 'Not an Isogram';
  }

  // Function to check if two strings are anagrams
  checkAnagram() {
    const str1 = this.inputString
      .toLowerCase()
      .replace(/[\W_]/g, '')
      .split('')
      .sort()
      .join('');
    const str2 = this.replaceFrom
      .toLowerCase()
      .replace(/[\W_]/g, '')
      .split('')
      .sort()
      .join('');
    this.resultString = str1 === str2 ? 'Anagram' : 'Not an Anagram';
  }

  // Function to convert input string to ASCII values
  toAscii() {
    this.resultString = this.inputString
      .split('')
      .map((char) => char.charCodeAt(0))
      .join(' ');
  }

  // Function to convert ASCII values to string
  fromAscii() {
    this.resultString = this.inputString
      .split(' ')
      .map((code) => String.fromCharCode(Number(code)))
      .join('');
  }

  // Function to reverse each word in the input string
  reverseEachWord() {
    this.resultString = this.inputString
      .split(' ')
      .map((word) => word.split('').reverse().join(''))
      .join(' ');
  }

  // Function to remove non-alphanumeric characters from the input string
  removeNonAlphanumeric() {
    this.resultString = this.inputString.replace(/[^a-z0-9]/gi, '');
  }

  // Function to find the longest word in the input string
  findLongestWord() {
    const words = this.inputString.match(/\b\w+\b/g);
    this.resultString = words
      ? words.reduce(
          (longest, current) =>
            current.length > longest.length ? current : longest,
          ''
        )
      : '';
  }

  // Function to find the shortest word in the input string
  findShortestWord() {
    const words = this.inputString.match(/\b\w+\b/g);
    this.resultString = words
      ? words.reduce(
          (shortest, current) =>
            current.length < shortest.length ? current : shortest,
          ''
        )
      : '';
  }

  // Function to calculate the sum of digits in the input string
  sumOfDigits() {
    const match = this.inputString.match(/\d/g);
    this.resultString = match
      ? match.reduce((sum, digit) => sum + Number(digit), 0).toString()
      : '0';
  }

  // Function to convert newlines to <br> in the input string
  convertNewlinesToBr() {
    this.resultString = this.inputString.replace(/\n/g, '<br>');
  }

  // Function to extract unique words in the input string
  extractUniqueWords() {
    const words = this.inputString.match(/\b\w+\b/g);
    this.resultString = words ? Array.from(new Set(words)).join(', ') : '';
  }

  // Function to find the most frequent word in the input string
  findMostFrequentWord() {
    const words = this.inputString.match(/\b\w+\b/g);
    if (words) {
      const frequencyMap = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      const mostFrequentWord = Object.keys(frequencyMap).reduce((a, b) =>
        frequencyMap[a] > frequencyMap[b] ? a : b
      );
      this.resultString = mostFrequentWord;
    } else {
      this.resultString = '';
    }
  }

  // Function to convert input string to Pig Latin
  toPigLatin() {
    this.resultString = this.inputString
      .split(' ')
      .map((word) =>
        word.length > 1 ? word.slice(1) + word[0] + 'ay' : word + 'ay'
      )
      .join(' ');
  }

  // Function to find the first non-repeated character in the input string
  findFirstNonRepeatedChar() {
    const frequencyMap = this.inputString.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    this.resultString =
      this.inputString.split('').find((char) => frequencyMap[char] === 1) || '';
  }

  // Function to generate a random string of specified length
  generateRandomString(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.resultString = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  }

  // Function to convert input string to binary
  toBinary() {
    this.resultString = this.inputString
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  }

  // Function to convert binary to string
  fromBinary() {
    this.resultString = this.inputString
      .split(' ')
      .map((bin) => String.fromCharCode(parseInt(bin, 2)))
      .join('');
  }

  // Function to find the longest palindrome substring in the input string
  findLongestPalindromeSubstring() {
    const isPalindrome = (s: string) => s === s.split('').reverse().join('');
    let longestPalindrome = '';
    for (let i = 0; i < this.inputString.length; i++) {
      for (let j = i + 1; j <= this.inputString.length; j++) {
        const substring = this.inputString.slice(i, j);
        if (
          isPalindrome(substring) &&
          substring.length > longestPalindrome.length
        ) {
          longestPalindrome = substring;
        }
      }
    }
    this.resultString = longestPalindrome;
  }

  // Function to find all substrings of a given length
  findAllSubstrings(length: number) {
    const substrings = [];
    for (let i = 0; i <= this.inputString.length - length; i++) {
      substrings.push(this.inputString.slice(i, i + length));
    }
    this.resultString = substrings.join(', ');
  }

  // Function to count occurrences of a specific word
  countSpecificWord(word: string) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const match = this.inputString.match(regex);
    this.resultString = match ? match.length.toString() : '0';
  }
}
