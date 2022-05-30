; (function ($, window, document, undefined) {
  'use strict';

  const pluginName = "crossWord";

  var defaults = {
    sizeX: 0,
    sizeY: 0,
    riddles: [],
    completed: false,
    won: false,
    startTime: null,
    endTime: null,
    instructions: "Answer the riddles below to solve the cross word:",
    labels: {
      acrossLabel: "Across:",
      downLabel: "Down:",
    },
    css: {
      gameMainContainerClass: "game-main-container",
      gamePanelContainerClass: "game-container-panel",
      gameRiddleContainerClass: "game-container-riddle",
      gamePanelClass: "game-panel",
      gamePanelRowClass: "game-panel-row",
      gamePanelCellClass: "game-panel-cell",
      gamePanelCellAcrossNumberClass: "game-panel-cell-across-number",
      gamePanelCellDownNumberClass: "game-panel-cell-down-number",
      gameCellWhiteClass: "game-cell-white",
      gameCellBlackClass: "game-cell-black",
      gameCellCorrectClass: "game-cell-correct",
      gameCellIncorrectClass: "game-cell-incorrect",
      gameCellValueClass: "game-cell-value",

      riddleBoxClass: "riddle-box",
      riddleSectionHeadingClass: "riddle-section-heading",
      riddleNumberClass: "riddle-number",
      riddleClass: "riddle",
      riddleInputClass: "riddle-input",
      riddleAnswerClass: "riddle-answer"
    }
  };

  function CrossWord(element, options) {

    const $target = (element instanceof jQuery) ? element : $(element);
    const self = this;

    var local = {
      settings: null,
      completed: false,
      gameMap: []
    };

    local.settings = $.extend(true, {}, defaults, options);

    // If riddles are not provided then do not continue.
    if (!local.settings.riddles) {
      throw 'riddles list not provided.';
    }

    var $gameMainContainer = $("<div class='" + local.settings.css.gameMainContainerClass + "'></div>");
    var $gamePanelContainer = $("<div class='" + local.settings.css.gamePanelContainerClass + "'></div>").appendTo($gameMainContainer);
    var $gameRiddleContainer = $("<div class='" + local.settings.css.gameRiddleContainerClass + "'></div>").appendTo($gameMainContainer);

    // Build game map.
    local.gameMap = buildBlankMap(local.settings.sizeX, local.settings.sizeY, "");

    // Initialize game map.
    $.each(local.settings.riddles, function (i, item) {
      var x = item.location.x;
      var y = item.location.y;
      var answerLength = item.answerLength;
      var across = item.across ? 1 : 0;
      var down = item.across ? 0 : 1;

      for (var a = 0; a < answerLength; a++) {
        local.gameMap[y + (a * down)][x + (a * across)] = '+';
      }
    });

    // Get across riddles
    var acrossRiddles = $.grep(local.settings.riddles, function (item) {
      return !!item.across;
    });

    // Get down riddles
    var downRiddles = $.grep(local.settings.riddles, function (item) {
      return !item.across;
    });

    // game panel rendering
    var $gamePanel = $("<div class='" + local.settings.css.gamePanelClass + "'></div>").appendTo($gamePanelContainer);
    var $rowTemplate = $("<div class='" + local.settings.css.gamePanelRowClass + "'></div>");
    var $cellTemplate = $("<div class='" + local.settings.css.gamePanelCellClass + "'><div class='" + local.settings.css.gameCellValueClass + "'></div></div>");
    var $acrossNumber = $("<div class='" + local.settings.css.gamePanelCellAcrossNumberClass + "'></div>");
    var $downNumber = $("<div class='" + local.settings.css.gamePanelCellDownNumberClass + "'></div>");

    // render game map
    for (var y = 0; y < local.settings.sizeY; y++) {
      var $row = $rowTemplate.clone();
      for (var x = 0; x < local.settings.sizeX; x++) {
        var $cell = $cellTemplate.clone().data('x', x).data('y', y);
        buildRiddleNumbers($cell, x, y);

        if (local.gameMap[y][x] != "") {
          $cell.addClass(local.settings.css.gameCellWhiteClass);
        } else {
          $cell.addClass(local.settings.css.gameCellBlackClass);
        }
        $row.append($cell);
      }
      $gamePanel.append($row);
    }

    // riddle panel rendering
    var $riddleBoxTemplate = $("<div class='" + local.settings.css.riddleBoxClass + "'></div>");
    var $riddleNumberTemplate = $("<div class='" + local.settings.css.riddleNumberClass + "'></div>");
    var $riddleTemplate = $("<div class='" + local.settings.css.riddleClass + "'></div>");
    var $riddleAnwerTemplate = $("<div class='" + local.settings.css.riddleAnswerClass + "'></div>");


    $("<div class='" + local.settings.css.riddleSectionHeadingClass + "' >" + local.settings.labels.acrossLabel + "</div>").appendTo($gameRiddleContainer);
    buildRiddleHints($gameRiddleContainer, $gamePanel, acrossRiddles, $riddleNumberTemplate, $riddleBoxTemplate, $riddleTemplate, $riddleAnwerTemplate);
    $("<div class='" + local.settings.css.riddleSectionHeadingClass + "' >" + local.settings.labels.downLabel + "</div>").appendTo($gameRiddleContainer);
    buildRiddleHints($gameRiddleContainer, $gamePanel, downRiddles, $riddleNumberTemplate, $riddleBoxTemplate, $riddleTemplate, $riddleAnwerTemplate);

    // attach all elements to target
    $target.append($gameMainContainer);

    // Fills Riddle numbers to cells for hints
    function buildRiddleNumbers($e, x, y) {
      var riddles = $.grep(local.settings.riddles, function (item) {
        return item.location.x == x && item.location.y == y;
      });

      $.each(riddles, function (i, riddle) {
        if (riddle.across) {
          $e.append($acrossNumber.clone().append(riddle.id));
        } else {
          $e.append($downNumber.clone().append(riddle.id));
        }
      });
    }

    function buildRiddleHints($gameRiddleContainer, $gamePanel, riddles, $riddleNumberTemplate, $riddleBoxTemplate, $riddleTemplate, $riddleAnwerTemplate) {
      $.each(riddles, function (i, item) {
        var $riddleBox = $riddleBoxTemplate.clone().appendTo($gameRiddleContainer);
        $riddleNumberTemplate.clone().append(item.id).appendTo($riddleBox);
        $riddleTemplate.clone().append(item.hint).appendTo($riddleBox);
        $riddleAnwerTemplate.clone().appendTo($riddleBox)
          .append(
            $("<input type='text' class='" + local.settings.css.riddleInputClass + "' maxlength=" + item.answerLength + " />")
              .data("id", item.id)
              .on('input', function (event) {
                $gamePanel.find('.' + local.settings.css.gameCellValueClass).empty();
                $.each(local.settings.riddles, function (i, riddle) {
                  var answerLength = riddle.answerLength;
                  var values = $("." + local.settings.css.riddleInputClass).filter(function (ii, input) {
                    return $(input).data("id") == riddle.id;
                  });
                  var valueCell = firstOrNull(values);
                  if (valueCell) {
                    var value = $(valueCell).val().toUpperCase();
                    var minlength = Math.min(value.length, answerLength);
                    var location = riddle.location;
                    var across = riddle.across ? 1 : 0;
                    var down = riddle.across ? 0 : 1;
                    for (var j = 0; j < answerLength; j++) {
                      var c = value.charAt(j);
                      var $cell = findGameCell(location.x + (j * across), location.y + (j * down));
                      if (j < minlength) {
                        $cell.find('.' + local.settings.css.gameCellValueClass).empty().append(c);
                      }
                    }
                  }
                });
              })
          );
      });
    }

    function markCompleted() {
      local.completed = true;
      $gameRiddleContainer.find('input').prop("disabled", true);
    }

    function isMarkedCompleted() {
      return local.completed;
    }

    function getProgress() {
      var inputs = $('.' + local.settings.css.gameRiddleContainerClass).find('.' + local.settings.css.riddleInputClass);
      var answers = $.map(inputs, function (item) {
        var $item = $(item);
        return { id: $item.data("id"), value: $item.val() };
      });

      return answers;
    }

    function isSolved(correctAnswers) {
      var progress = getProgress();
      var validations = answerValidations(correctAnswers, progress);
      return validations.reduce(function (acc, item) {
        return acc && item.isValid;
      }, true) && correctAnswers && correctAnswers.length && progress.length;
    }

    function showResults(correctAnswers) {
      var progress = getProgress();

      // build blank matrix;
      var cAnswerMatrix = buildBlankMap(local.settings.sizeX, local.settings.sizeY, "-");
      var uAnswerMatrix = buildBlankMap(local.settings.sizeX, local.settings.sizeY, "-");

      // fill answers
      $.each(local.settings.riddles, function (i, item) {
        var locationX = item.location.x;
        var locationY = item.location.y;
        var answerLength = item.answerLength;
        var across = item.across ? 1 : 0;
        var down = item.across ? 0 : 1;
        var cAnswers = $.grep(correctAnswers, function (a) {
          return a.id == item.id;
        });
        var uAnswers = $.grep(progress, function (a) {
          return a.id == item.id;
        });
        var cAnswer = firstOrNull(cAnswers);
        var uAnswer = firstOrNull(uAnswers);

        if (cAnswer) {
          var cAnswerValue = cAnswer.value;
          var minLength = Math.min(cAnswerValue.length, answerLength);
          for (var a = 0; a < minLength; a++) {
            var x = locationX + (a * across);
            var y = locationY + (a * down);
            cAnswerMatrix[y][x] = cAnswerValue.charAt(a);
            if (uAnswer && uAnswer.value && uAnswer.value.length <= minLength) {
              uAnswerMatrix[y][x] = uAnswer.value.charAt(a);
            }
          }
        }
      });

      for (var y = 0; y < local.settings.sizeY; y++) {
        for (var x = 0; x < local.settings.sizeX; x++) {
          if (local.gameMap[y][x] == "+") {
            var $e = findGameCell(x, y);
            if (cAnswerMatrix[y][x] == uAnswerMatrix[y][x]) {
              $e.removeClass(local.settings.css.gameCellIncorrectClass)
                .addClass(local.settings.css.gameCellCorrectClass)
            } else {
              $e.removeClass(local.settings.css.gameCellCorrectClass)
                .addClass(local.settings.css.gameCellIncorrectClass);
            }
          }
        }
      }
    }

    function answerValidations(correctAnswers, progress) {
      return $.map(correctAnswers, function (correctAnswer) {
        var userAnswers = $.grep(progress, function (ua) {
          return ua.id == correctAnswer.id;
        });
        var userAnswer = firstOrNull(userAnswers);
        if (userAnswer) {
          return {
            id: correctAnswer.id,
            value: correctAnswer.value,
            isValid: correctAnswer.value == userAnswer.value
          };
        }
        throw "invalid parameter provided.";
      });
    }

    function firstOrNull(arr) {
      if (arr instanceof jQuery) {
        return arr && arr.length && arr[0] ? arr[0] : null;
      } else {
        return arr && Array.isArray(arr) && arr.length && arr[0] ? arr[0] : null;
      }
    }

    function findGameCell(x, y) {
      return $gamePanel.find('.' + local.settings.css.gamePanelCellClass).filter(function (i, e) {
        return $(e).data('x') == x && $(e).data('y') == y
      });
    }

    function buildBlankMap(width, height, defaultValue) {
      var matrix = [];
      for (var y = 0; y < height; y++) {
        var row = [];
        for (var x = 0; x < width; x++) {
          row.push(defaultValue);
        }
        matrix.push(row);
      }
      return matrix;
    }

    return {
      isSolved: isSolved,
      showResults: showResults,
      markCompleted: markCompleted,
      isMarkedCompleted: isMarkedCompleted,
      getProgress: getProgress
    };
  }

  CrossWord.prototype = {
    isSolved: function () {
      isSolved();
    },
    showResults: function () {
      showResults();
    },
    markCompleted: function () {
      markCompleted();
    },
    isMarkedCompleted: function () {
      return isMarkedCompleted();
    },
    getProgress: function () {
      return getProgress();
    }
  }

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        var plugin = new CrossWord(this, options);
        $.data(this, pluginName, plugin);
      }
    });
  }

})(jQuery, window, document);
