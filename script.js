(function () {
  'use strict';

  const ANSWERS = {
    grammar1: ['m', 'm', 'are', 'm', 'are', 'am', 'm', 'are'],
    grammar2: ['is', "isn't", 'is', 'is', 'is', "isn't", 'is', 'am', 'are'],
    grammar3: ['an', 'has', 'glasses', 'have', 'an'],
    readingTf: ['T', 'T', 'F', 'T', 'F'],
    readingMatch: ['C', 'A', 'D', 'E', 'B']
  };

  const MAX_SCORE = 32;

  var correctAnswersFlat = [].concat(
    ANSWERS.grammar1,
    ANSWERS.grammar2,
    ANSWERS.grammar3,
    ANSWERS.readingTf,
    ANSWERS.readingMatch
  );

  /** Правильные ответы для отображения: полные предложения или куски текста */
  var correctAnswersDisplay = [].concat(
    [
      "I'm Petros.",
      "I'm Hana.",
      "Are you a student?",
      "I'm not.",
      "Are you from Germany?",
      "Yes, I am",
      "I'm from Beijing.",
      "Are you Chinese?"
    ],
    [
      "My sister is a student.",
      "Paris isn't in India.",
      "Yun is from Korea.",
      "Where is the airport?",
      "Is Melbourne in Australia?",
      "She isn't in my class.",
      "What is your name?",
      "I am a teacher.",
      "We are from London."
    ],
    [
      "I have an email.",
      "She has a new phone.",
      "I have glasses.",
      "You have a sandwich.",
      "New York is an American city."
    ],
    [
      "Hailey is a student. — True",
      "Daniel is from France. — True",
      "Victor is Spanish. — False",
      "Victor is happy. — True",
      "Sue is from the UK. — False"
    ],
    [
      "Hailey — C. singer",
      "Daniel — A. waiter",
      "Marc — D. taxi driver",
      "Victor — E. shop assistant",
      "Sue — B. nurse"
    ]
  );

  const toastEl = document.getElementById('result-toast');
  const checkBtn = document.getElementById('check-btn');
  const nameLink = document.getElementById('name-link');
  const nameInput = document.getElementById('user-name');
  const confirmModal = document.getElementById('confirm-modal');
  const confirmSubmitBtn = document.getElementById('confirm-submit-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
  const scoreDisplay = document.getElementById('score-display');

  if (nameLink && nameInput) {
    nameLink.addEventListener('click', function (e) {
      e.preventDefault();
      nameInput.classList.remove('hidden');
      nameInput.focus();
      nameLink.classList.add('hidden');
    });
  }

  var questionNames = [
    'g1-1','g1-2','g1-3','g1-4','g1-5','g1-6','g1-7','g1-8',
    'g2-1','g2-2','g2-3','g2-4','g2-5','g2-6','g2-7','g2-8','g2-9',
    'g3-1','g3-2','g3-3','g3-4','g3-5',
    'tf-1','tf-2','tf-3','tf-4','tf-5',
    'match-1','match-2','match-3','match-4','match-5'
  ];

  function getFieldValue(name) {
    if (name.indexOf('tf-') === 0) {
      var checked = document.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : '';
    }
    var el = document.querySelector('.test-section [name="' + name + '"]');
    return el ? el.value : '';
  }

  function isAllFilled() {
    for (var i = 0; i < questionNames.length; i++) {
      var v = getFieldValue(questionNames[i]);
      if (normalizeText(String(v)) === '') return false;
    }
    return true;
  }

  function hasName() {
    return nameInput && normalizeText(nameInput.value) !== '';
  }

  function showModal() {
    if (confirmModal) confirmModal.classList.remove('hidden');
  }

  function hideModal() {
    if (confirmModal) confirmModal.classList.add('hidden');
  }

  function showToast(message, type) {
    toastEl.textContent = message;
    toastEl.className = 'toast ' + (type || 'info');
    toastEl.classList.remove('hidden');
    setTimeout(function () {
      toastEl.classList.add('hidden');
    }, 5000);
  }

  function normalizeText(s) {
    return (s || '').trim().toLowerCase();
  }

  function clearFeedback() {
    document.querySelectorAll('.test-section input, .test-section select').forEach(function (el) {
      el.classList.remove('correct', 'incorrect');
    });
    document.querySelectorAll('.tf-list li').forEach(function (li) {
      li.classList.remove('correct', 'incorrect');
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sendMessageToTelegram(token, chatId, message, parseMode) {
    var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
    var data = {
      chat_id: chatId,
      text: message
    };
    if (parseMode) data.parse_mode = parseMode;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (response) { return response.json(); })
      .then(function (result) { console.log('Сообщение отправлено:', result); })
      .catch(function (error) { console.error('Ошибка при отправке сообщения:', error); });
  }

  function checkGrammar1() {
    let score = 0;
    for (let i = 0; i < 8; i++) {
      const select = document.querySelector('select[name="g1-' + (i + 1) + '"]');
      const value = select ? select.value : '';
      const correct = value === ANSWERS.grammar1[i];
      if (correct) score++;
      if (select) select.classList.add(correct ? 'correct' : 'incorrect');
    }
    return score;
  }

  function checkGrammar2() {
    let score = 0;
    for (let i = 0; i < 9; i++) {
      const input = document.querySelector('input[name="g2-' + (i + 1) + '"]');
      const value = normalizeText(input ? input.value : '');
      const expected = ANSWERS.grammar2[i].toLowerCase();
      const correct = value === expected;
      if (correct) score++;
      if (input) input.classList.add(correct ? 'correct' : 'incorrect');
    }
    return score;
  }

  function checkGrammar3() {
    let score = 0;
    for (let i = 0; i < 5; i++) {
      const input = document.querySelector('input[name="g3-' + (i + 1) + '"]');
      const value = normalizeText(input ? input.value : '');
      const expected = ANSWERS.grammar3[i].toLowerCase();
      const correct = value === expected;
      if (correct) score++;
      if (input) input.classList.add(correct ? 'correct' : 'incorrect');
    }
    return score;
  }

  function checkReadingTf() {
    let score = 0;
    for (let i = 0; i < 5; i++) {
      const name = 'tf-' + (i + 1);
      const checked = document.querySelector('input[name="' + name + '"]:checked');
      const value = checked ? checked.value : '';
      const correct = value === ANSWERS.readingTf[i];
      if (correct) score++;
      const li = document.querySelector('.tf-list li:nth-child(' + (i + 1) + ')');
      if (li) li.classList.add(correct ? 'correct' : 'incorrect');
    }
    return score;
  }

  function checkReadingMatch() {
    let score = 0;
    for (let i = 0; i < 5; i++) {
      const select = document.querySelector('select[name="match-' + (i + 1) + '"]');
      const value = select ? select.value : '';
      const correct = value === ANSWERS.readingMatch[i];
      if (correct) score++;
      if (select) select.classList.add(correct ? 'correct' : 'incorrect');
    }
    return score;
  }

  function collectErrors() {
    var errors = [];
    for (var i = 0; i < questionNames.length; i++) {
      var name = questionNames[i];
      var userVal = getFieldValue(name);
      var correctVal = correctAnswersFlat[i];
      var isTextInput = name.indexOf('g2-') === 0 || name.indexOf('g3-') === 0;
      var correct = isTextInput
        ? normalizeText(userVal) === correctVal.toLowerCase()
        : (userVal || '') === (correctVal || '');
      if (!correct) {
        errors.push({
          num: i + 1,
          user: normalizeText(String(userVal)) === '' ? '(пусто)' : userVal,
          correct: correctAnswersDisplay[i]
        });
      }
    }
    return errors;
  }

  function doCheck() {
    clearFeedback();

    var s1 = checkGrammar1();
    var s2 = checkGrammar2();
    var s3 = checkGrammar3();
    var s4 = checkReadingTf();
    var s5 = checkReadingMatch();

    var total = s1 + s2 + s3 + s4 + s5;
    var pct = Math.round((total / MAX_SCORE) * 100);
    var errors = collectErrors();

    var sectionScores = [
      { section: 'grammar-1', score: s1, max: 8 },
      { section: 'grammar-2', score: s2, max: 9 },
      { section: 'grammar-3', score: s3, max: 5 },
      { section: 'reading-tf', score: s4, max: 5 },
      { section: 'reading-match', score: s5, max: 5 }
    ];
    sectionScores.forEach(function (item) {
      var badge = document.querySelector('.test-section[data-section="' + item.section + '"] .score-badge');
      if (badge) badge.textContent = item.score + '/' + item.max;
    });

    if (scoreDisplay) {
      scoreDisplay.textContent = 'Общие баллы: ' + MAX_SCORE + '. Фактически набранных: ' + total + ' из ' + MAX_SCORE + ' баллов (' + pct + '%).';
      scoreDisplay.classList.remove('hidden');
    }

    var msg = 'Результат: ' + total + ' из ' + MAX_SCORE + ' баллов (' + pct + '%). ';
    if (total === MAX_SCORE) {
      msg += 'Отлично!';
      showToast(msg, 'success');
    } else if (pct >= 70) {
      msg += 'Хороший результат.';
      showToast(msg, 'success');
    } else {
      msg += 'Проверьте себя ещё разок';
      showToast(msg, 'info');
    }

    var userName = nameInput ? nameInput.value.trim() : '';
    var resultLabel = total === MAX_SCORE ? 'Отлично!' : (pct >= 70 ? 'Хороший результат.' : 'Проверьте ошибки.');

    function padRight(str, len) {
      var s = String(str);
      return s.length >= len ? s.slice(0, len) : s + (new Array(len - s.length + 1).join(' '));
    }

    var telegramMsg = '<b>Результат теста</b>\n\n';
    telegramMsg += '<pre>';
    telegramMsg += '┌────────────┬──────────────────────┐\n';
    telegramMsg += '│ Имя        │ ' + padRight(escapeHtml(userName), 20) + '│\n';
    telegramMsg += '├────────────┼──────────────────────┤\n';
    telegramMsg += '│ Баллы      │ ' + padRight(total + ' / ' + MAX_SCORE + ' (' + pct + '%)', 20) + '│\n';
    telegramMsg += '│ Результат  │ ' + padRight(escapeHtml(resultLabel), 20) + '│\n';
    telegramMsg += '└────────────┴──────────────────────┘';
    telegramMsg += '</pre>';

    if (errors.length > 0) {
      var numCol = 3;
      var userCol = 14;
      var correctCol = 40;
      var sep = ' │ ';
      var headerNum = padRight('№', numCol);
      var headerUser = padRight('Ваш ответ', userCol);
      var headerCorrect = padRight('Правильно', correctCol);
      telegramMsg += '\n\n<b>Ошибки</b>\n<pre>';
      telegramMsg += '┌─────┬─────────────────┬───────────────────────────────────────────┐\n';
      telegramMsg += '│' + sep + headerNum + sep + headerUser + sep + headerCorrect + ' │\n';
      telegramMsg += '├─────┼─────────────────┼───────────────────────────────────────────┤\n';
      errors.forEach(function (e) {
        var num = padRight(e.num, numCol);
        var user = padRight(escapeHtml(e.user).slice(0, userCol), userCol);
        var correct = escapeHtml(e.correct);
        if (correct.length > correctCol) correct = correct.slice(0, correctCol - 2) + '..';
        correct = padRight(correct, correctCol);
        telegramMsg += '│' + sep + num + sep + user + sep + correct + ' │\n';
      });
      telegramMsg += '└─────┴─────────────────┴───────────────────────────────────────────┘';
      telegramMsg += '</pre>';
    }

    var botToken = '8543757949:AAHkb7EeGKgHpNsH7DJN0sc3jgoM-3U4Ibg';
    var chatId = '385632170';
    sendMessageToTelegram(botToken, chatId, telegramMsg, 'HTML');
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      if (!hasName()) {
        showToast('Введите имя', 'info');
        if (nameInput) nameInput.focus();
        return;
      }
      if (!isAllFilled()) {
        showModal();
      } else {
        doCheck();
      }
    });
  }

  if (confirmSubmitBtn) {
    confirmSubmitBtn.addEventListener('click', function () {
      hideModal();
      if (!hasName()) {
        showToast('Введите имя', 'info');
        if (nameInput) nameInput.focus();
        return;
      }
      doCheck();
    });
  }
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', hideModal);
  }
  if (confirmModal) {
    var backdrop = confirmModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', hideModal);
  }
})();
