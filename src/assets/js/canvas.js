'use strict';
/** Canvas JS */
(function () {





  // var socket = io('http://127.0.0.1:3000');
  const current_url = window.location.href;
  const roomName = current_url.split("/").pop();
  // if (window.referenceToken)
  //   socket.emit("join_room", window.referenceToken)
  // else {
  //   console.error("Unable to join the room");
  //   // return;
  // }


  // This object holds the implementation of each drawing tool.
  var tools = {};
  var textarea;
  var colorPicked = "#000";
  var lineWidthPicked = 4;
  var SelectedFontFamily = "Verdana";
  var SelectedFontSize = 24;
  var isDrawing, points = [];
  var undoStack = [],
    redoStack = [],
    masterStack = [];
  var paths = [];
  var dragging = false;
  var debugArray = [];
  var tmp_txt_ctn = document.createElement('div');
  var globalArray = [];
  tmp_txt_ctn.style.display = 'none';
  // Keep everything in anonymous function, called on window load.
  if (window.addEventListener) {
    window.addEventListener('load', function () {
      var canvas, context, canvaso, contexto;
      let selectedColorsArr = {
        pencil: "#000000",
        rectFilled: "#000000",
        rect: "#000000",
        circle: "#000000",
        text: "#000000",
        highlighter: "#ffbf00",
        line: "#000000",
        hexagon: "#000000",
        ellipse: "#000000",
      };

      var canvasHeight = screen.height;
      var canvasWidth = document.getElementById('should_publish_whiteboard').offsetWidth;
      var hasCheckDimensions = false;
      $(document).on("click", "#white_board_button", (e) => {
        if (!hasCheckDimensions) {
          let paramHeight = screen.height;
          let paramWidth = document.getElementById('should_publish_whiteboard').offsetWidth;
          updateCanvas(paramWidth, paramHeight)
          hasCheckDimensions = true;
        }
      })

      $(document).on("click", ".tool_btn", function (e) {
        const $element = $(this);
        if (!$element.parent().hasClass("toolbox"))
          $('.toolbox').removeClass("is__visible");

        if ($element.next().hasClass("toolbox"))
          $element.next('.toolbox').addClass("is__visible");

      })

      $(document).on("click", ".child_tool_btn", function (e) {
        const $element = $(this);

        const setClassName = $element.find('i').attr("class");
        $element.parents(".toolbox").prev(".has_children").find('i').removeAttr("class").addClass(setClassName);
        $element.parents(".toolbox").next(".clrPick_ele").find(".colour-picker").attr("data-ref", $element.val());

        getColor();
      })


      // $(window).on("resize", function () {
      //   let paramHeight = screen.height;
      //   let paramWidth = document.getElementById('should_publish_whiteboard').offsetWidth;
      //   // updateCanvas(paramWidth, paramHeight)
      // });


      // The active tool instance.
      var tool;
      var tool_default = 'pencil';
      //Choose colour picker
      colorPicked = "#000000";

      $(document).on("change", "input[type='color']", function (e) {
        getColor();

        const selectedToolValue = $(this).attr("data-ref");
        if (tools[selectedToolValue]) {
          tool = new tools[selectedToolValue]();
        }
        $("#" + selectedToolValue + "-button").trigger("click");
        $(this).parent().css("background", $(this).val());
      })


      $(document).on("keyup", "input[type='color']", function (e) {
        $(this).parent().css("background", $(this).val());
      })

      function getColor() {
        if ($(".colour-picker").length) {
          $('.colour-picker').each(function (e) {
            const colorFor = $(this).attr("data-ref");
            if (colorFor != "highlighter")
              selectedColorsArr[colorFor] = $(this).val();
          })
          // return colorPicked = $("#colour-picker").val();
        }

      };

      function init() {
        // Find the canvas element.
        canvaso = document.getElementById('imageView');
        if (!canvaso) {
          alert('Error: I cannot find the canvas element!');
          return;
        }
        canvaso.setAttribute("width", canvasWidth);
        canvaso.setAttribute("height", canvasHeight);

        if (!canvaso.getContext) {
          alert('Error: no canvas.getContext!');
          return;
        }

        // Get the 2D canvas context.
        contexto = canvaso.getContext('2d');
        if (!contexto) {
          alert('Error: failed to getContext!');
          return;
        }

        // Add the temporary canvas.
        var container = canvaso.parentNode;
        canvas = document.createElement('canvas');
        if (!canvas) {
          alert('Error: I cannot create a new canvas element!');
          return;
        }

        canvas.id = 'imageTemp';
        // we replaced everywhere canvaso.width and height with global setting canvasWidth canvasHeight
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        container.appendChild(canvas);

        //Text Tool start

        textarea = document.createElement('textarea');
        textarea.id = 'text_tool';
        textarea.focus();
        textarea.className += " form-control";
        container.appendChild(textarea);

        // Text tool's text container for calculating
        // lines/chars
        container.appendChild(tmp_txt_ctn);
        context = canvas.getContext('2d');

        // Get the tool select input.
        // var tool_select = document.getElementById('dtool');
        var tool_select = document.getElementById('pencil-button');

        //tool_select.addEventListener('change', ev_tool_change, false);



        // colorPicked = getColor();

        //Choose line Width

        if ($("#line-Width").length)
          lineWidthPicked = $("#line-Width").val();

        $("#line-Width").change(function () {
          lineWidthPicked = $("#line-Width").val();
        });

        //SelectedFontFamily
        if ($("#draw-text-font-family").length)
          SelectedFontFamily = $("#draw-text-font-family").val();

        $("#draw-text-font-family").change(function () {
          SelectedFontFamily = $("#draw-text-font-family").val();
        })

        //SelectedFontSize
        if ($("#draw-text-font-size").length)
          SelectedFontSize = $("#draw-text-font-size").val();

        $("#draw-text-font-family").change(function () {
          SelectedFontSize = $("#draw-text-font-size").val();
        })


        // Activate the default tool.
        if (tools[tool_default]) {
          tool = new tools[tool_default]();
          tool_select.value = tool_default;
        }

        function pic_tool_click(pick) {
          if (tools[pick.value]) {
            tool = new tools[pick.value]();
          }
        }

        $("#pencil-button").click(function () {
          pic_tool_click(this)
        });

        $("#rect-button").click(function () {
          pic_tool_click(this)
        });

        $("#circle-button").click(function () {
          pic_tool_click(this)
        });

        $("#ellipse-button").click(function () {
          pic_tool_click(this)
        });

        $("#line-button").click(function () {
          pic_tool_click(this)
        });

        $("#text-button").click(function () {
          pic_tool_click(this)
        });

        $("#eraser").click(function () {
          pic_tool_click(this)
        });

        $("#hexagon-button").click(function () {
          pic_tool_click(this)
        });

        $("#highlighter").click(function () {
          pic_tool_click(this)
        });

        $("#drag").click(function () {
          pic_tool_click(this)
        });

        $("#undo").click(function () {
          pic_tool_click(this)
        });

        $("#redo").click(function () {
          pic_tool_click(this)
        });

        $("#rectFilled-button").click(function () {
          pic_tool_click(this)
        });


        // limit the number of events per second
        function throttle(callback, delay) {
          var previousCall = new Date().getTime();
          return function () {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
              previousCall = time;
              callback.apply(null, arguments);
            }
          };
        }

        // Attach the mousedown, mousemove and mouseup event listeners.
        canvas.addEventListener('mousedown', ev_canvas, false);
        //canvas.addEventListener('mousemove', ev_canvas, false);
        canvas.addEventListener('mousemove', throttle(ev_canvas, 10), false);
        canvas.addEventListener('mouseup', ev_canvas, false);

      }


      function updateCanvas(paramWidth, paramHeight) {
        canvaso.width = canvas.width = paramWidth;
        canvaso.height = canvas.height = paramHeight;
        canvasHeight = paramHeight;
        canvasWidth = paramWidth;
        setBackground();
        for (let index = 0; index < globalArray.length; index++) {
          const coordinates = globalArray[index];
          if (coordinates.mode == "drawing") //  pencil
            drawPencil(coordinates.x0, coordinates.y0, coordinates.x1, coordinates.y1, coordinates.color, coordinates.lineThickness);


        }
        // setTimeout(() => img_update(), 200)

      }

      // The general-purpose event handler. This function just determines the mouse 
      // position relative to the canvas element.
      function ev_canvas(ev) {
        var CanvPos = canvas.getBoundingClientRect(); //Global Fix cursor position bug
        if (ev.clientX || ev.clientX == 0) { // Firefox
          //ev._x = ev.clientX;
          ev._x = ev.clientX - CanvPos.left;
          // ev._x = ev.layerX;
          //ev._y = ev.clientY;
          ev._y = ev.clientY - CanvPos.top;
          //ev._y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
          //ev._x = ev.offsetX;
          //ev._y = ev.offsetY;
        }

        // Call the event handler of the tool.
        var func = tool[ev.type];
        if (func) {
          func(ev);
        }
        //Hide textbox if not equals to text tool


      }

      // The event handler for any changes made to the tool selector.
      function ev_tool_change(ev) {
        if (tools[this.value]) {
          tool = new tools[this.value]();
        }
      }


      // This function draws the #imageTemp canvas on top of #imageView, after which 
      // #imageTemp is cleared. This function is called each time when the user 
      // completes a drawing operation.
      function img_update(trans = false) {
        masterStack.push(canvaso.toDataURL());
        contexto.drawImage(canvas, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!trans) {
          return;
        }

        // socket.emit('copyCanvas', {
        //   room: roomName,
        //   transferCanvas: true
        // });
      }

      function onCanvasTransfer(data) {
        img_update();
      }

      // socket.on('copyCanvas', onCanvasTransfer);

      // colorPicked = getColor();

      // The drawing pencil.
      function drawPencil(x0, y0, x1, y1, color, linewidth, emit) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        if (color)
          context.strokeStyle = color;
        else
          context.strokeStyle = selectedColorsArr.pencil;
        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;

        context.lineJoin = context.lineCap = 'round';

        context.stroke();
        context.closePath();

        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        globalArray.push({
          room: roomName,
          x0: x0,
          y0: y0,
          x1: x1,
          y1: y1,
          color: colorPicked,
          lineThickness: lineWidthPicked,
          mode: "drawing"
        });
        // socket.emit('drawing', {
        //   room: roomName,
        //   x0: x0 / w,
        //   y0: y0 / h,
        //   x1: x1 / w,
        //   y1: y1 / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });
      }

      function onDrawingEvent(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawPencil(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
      }

      // socket.on('drawing', onDrawingEvent);


      tools.pencil = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";
        // This is called when you start holding down the mouse button.
        // This starts the pencil drawing.
        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };
        // This function is called every time you move the mouse. Obviously, it only 
        // draws if the tool.started state is set to true (when you are holding down 
        // the mouse button).
        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.pencil;
          if (tool.started) {
            drawPencil(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
            tool.x0 = ev._x;
            tool.y0 = ev._y;
          }
        };
        // This is called when you release the mouse button.
        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };
      };

      //Rect
      function drawRect(min_x, min_y, abs_x, abs_y, color, linewidth, emit) {

        context.clearRect(0, 0, canvas.width, canvas.height);
        if (color)
          context.strokeStyle = color;
        else
          context.strokeStyle = colorPicked;
        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;

        context.strokeRect(min_x, min_y, abs_x, abs_y);

        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('rectangle', {
        //   room: roomName,
        //   min_x: min_x / w,
        //   min_y: min_y / h,
        //   abs_x: abs_x / w,
        //   abs_y: abs_y / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });

      }

      function onDrawRect(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawRect(data.min_x * w, data.min_y * h, data.abs_x * w, data.abs_y * h, data.color, data.lineThickness);
      }

      // socket.on('rectangle', onDrawRect);


      // The rectangle tool.
      tools.rect = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        //above the tool function

        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };

        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.rect;
          if (!tool.started) {
            return;
          }

          var pos_x = Math.min(ev._x, tool.x0),
            pos_y = Math.min(ev._y, tool.y0),
            pos_w = Math.abs(ev._x - tool.x0),
            pos_h = Math.abs(ev._y - tool.y0);

          context.clearRect(0, 0, canvas.width, canvas.height); //in drawRect

          if (!pos_w || !pos_h) {
            return;
          }
          drawRect(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
          //context.strokeRect(x, y, w, h); // in drawRect
        };

        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };
      };

      // draw filled rect

      //Rect
      function drawRectFilled(min_x, min_y, abs_x, abs_y, color, linewidth, emit) {

        context.clearRect(0, 0, canvas.width, canvas.height);

        let selectedColor = colorPicked;
        if (color)
          selectedColor = color;

        context.fillStyle = selectedColor;

        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;

        context.fillRect(min_x, min_y, abs_x, abs_y);

        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('filled_rectangle', {
        //   room: roomName,
        //   min_x: min_x / w,
        //   min_y: min_y / h,
        //   abs_x: abs_x / w,
        //   abs_y: abs_y / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });

      }

      function onDrawRectFilled(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawRectFilled(data.min_x * w, data.min_y * h, data.abs_x * w, data.abs_y * h, data.color, data.lineThickness);
      }

      // socket.on('filled_rectangle', onDrawRectFilled);


      // The rectangle tool.
      tools.rectFilled = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        //above the tool function

        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };

        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.rectFilled;
          if (!tool.started) {
            return;
          }

          var pos_x = Math.min(ev._x, tool.x0),
            pos_y = Math.min(ev._y, tool.y0),
            pos_w = Math.abs(ev._x - tool.x0),
            pos_h = Math.abs(ev._y - tool.y0);

          context.clearRect(0, 0, canvas.width, canvas.height); //in drawRect

          if (!pos_w || !pos_h) {
            return;
          }
          drawRectFilled(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
          //context.strokeRect(x, y, w, h); // in drawRect
        };

        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };
      };

      //Lines
      function drawLines(x0, y0, x1, y1, color, linewidth, emit) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        if (color)
          context.strokeStyle = color;
        else
          context.strokeStyle = colorPicked;
        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;
        context.stroke();
        context.closePath();


        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('linedraw', {
        //   room: roomName,
        //   x0: x0 / w,
        //   y0: y0 / h,
        //   x1: x1 / w,
        //   y1: y1 / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });

      }

      function onDrawLines(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawLines(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
      }

      // socket.on('linedraw', onDrawLines);


      // The line tool.
      tools.line = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";


        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };

        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.line;
          if (!tool.started) {
            return;
          }
          drawLines(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
        };

        this.mouseup = function (ev) {

          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };

      };


      //New Circle Function
      function drawCircle(x1, y1, x2, y2, color, linewidth, emit) {

        context.clearRect(0, 0, canvas.width, canvas.height);

        var x = (x2 + x1) / 2;
        var y = (y2 + y1) / 2;

        var radius = Math.max(
          Math.abs(x2 - x1),
          Math.abs(y2 - y1)
        ) / 2;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        // context.arc(x, y, 5, 0, Math.PI*2, false);
        context.closePath();
        if (color)
          context.strokeStyle = color;
        else
          context.strokeStyle = colorPicked;
        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;
        context.stroke();


        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('circledraw', {
        //   room: roomName,
        //   x1: x1 / w,
        //   y1: y1 / h,
        //   x2: x2 / w,
        //   y2: y2 / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });

      }

      function onDrawCircle(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawCircle(data.x1 * w, data.y1 * h, data.x2 * w, data.y2 * h, data.color, data.lineThickness);
      }

      // socket.on('circledraw', onDrawCircle);


      // The Circle tool.
      tools.circle = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        this.mousedown = function (ev) {
          tool.started = true;
          var rect = canvas.getBoundingClientRect();
          tool.x1 = ev.clientX - rect.left;
          tool.y1 = ev.clientY - rect.top;
          // getColor();
        };

        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.circle;;

          if (!tool.started) {
            return;
          }

          var rect = canvas.getBoundingClientRect();
          tool.x2 = ev.clientX - rect.left;
          tool.y2 = ev.clientY - rect.top;

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawCircle(tool.x1, tool.y1, tool.x2, tool.y2, colorPicked, lineWidthPicked, true);

          //context.strokeStyle = 'rgba(255, 0, 0, 0.5)'; //for old_drawCircle
          //context.strokeRect(x1, y1, x2-x1, y2-y1);

        };

        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };

      };

      //Ellipse Tool 


      function drawEllipse(x, y, w, h, color, linewidth, emit) {

        context.clearRect(0, 0, canvas.width, canvas.height);
        var ox, oy, xe, ye, xm, ym;
        var kappa = .5522848;
        ox = (w / 2) * kappa, // control point offset horizontal
          oy = (h / 2) * kappa, // control point offset vertical
          xe = x + w, // x-end
          ye = y + h, // y-end
          xm = x + w / 2, // x-middle
          ym = y + h / 2; // y-middle

        context.beginPath();
        context.moveTo(x, ym);
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        context.closePath();

        let selectedColor = colorPicked;
        if (color)
          selectedColor = color;

        context.fillStyle = selectedColor;
        context.fill();

        context.strokeStyle = selectedColor;
        if (linewidth)
          context.lineWidth = linewidth;
        else
          context.lineWidth = lineWidthPicked;
        context.stroke();


        if (!emit) {
          return;
        }
        var canv_w = canvasWidth;
        var canv_h = canvasHeight;

        // socket.emit('ellipsedraw', {
        //   room: roomName,
        //   x: x,
        //   y: y,
        //   w: w,
        //   h: h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });

      }



      function onDrawEllipse(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawEllipse(data.x, data.y, data.w, data.h, data.color, data.lineThickness);
      }

      // socket.on('ellipsedraw', onDrawEllipse);


      // The Ellipse tool.
      tools.ellipse = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };

        this.mousemove = function (ev) {
          // colorPicked = getColor();
          colorPicked = selectedColorsArr.ellipse;
          if (!tool.started) {
            return;
          }

          var x = Math.min(ev._x, tool.x0);
          var y = Math.min(ev._y, tool.y0);

          var w = Math.abs(ev._x - tool.x0);
          var h = Math.abs(ev._y - tool.y0);

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawEllipse(x, y, w, h, colorPicked, lineWidthPicked, true);

        };

        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };

      };


      function DrawText(fsize, ffamily, colorVal, textPosLeft, textPosTop, processed_lines, emit) {
        context.font = fsize + ' ' + ffamily;
        context.textBaseline = 'top';
        context.fillStyle = colorVal;

        for (var n = 0; n < processed_lines.length; n++) {
          var processed_line = processed_lines[n];

          context.fillText(
            processed_line,
            parseInt(textPosLeft),
            parseInt(textPosTop) + n * parseInt(fsize)
          );
        }

        img_update(); //Already emitting no need true param

        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('textdraw', {
        //   room: roomName,
        //   fsize: fsize,
        //   ffamily: ffamily,
        //   colorVal: colorVal,
        //   textPosLeft: textPosLeft,
        //   textPosTop: textPosTop,
        //   processed_linesArray: processed_lines
        // });

      }

      function onTextDraw(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        DrawText(data.fsize, data.ffamily, data.colorVal, data.textPosLeft, data.textPosTop, data.processed_linesArray);
      }

      // socket.on('textdraw', onTextDraw);


      var textareaVisible = false;
      tools.text = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();

          var x = Math.min(ev._x, tool.x0);
          var y = Math.min(ev._y, tool.y0);
          var width = Math.abs(ev._x - tool.x0);
          var height = Math.abs(ev._y - tool.y0);
          if (textareaVisible == false) {
            textarea.style.left = x + 'px';
            textarea.style.top = y + 'px';
            // textarea.style.width = '300px';
            // textarea.style.height = '200px';
            textarea.setAttribute("placeholder", "Type here..");
            textarea.style.display = 'block';
            textarea.style.color = colorPicked;
            textarea.style.font = SelectedFontSize + 'px' + ' ' + SelectedFontFamily;
            // $(textarea).css('resize', 'both');
            textareaVisible = true;
          }

        };

        this.mousemove = function (ev) {
          // colorPicked = getColor();
          colorPicked = selectedColorsArr.text;

          if (!tool.started) {
            return;
          }


        };

        this.mouseup = function (ev) {
          if (tool.started) {

            //start      
            var lines = textarea.value.split('\n');
            var processed_lines = [];

            for (var i = 0; i < lines.length; i++) {
              var chars = lines[i].length;

              for (var j = 0; j < chars; j++) {
                var text_node = document.createTextNode(lines[i][j]);
                tmp_txt_ctn.appendChild(text_node);

                // Since tmp_txt_ctn is not taking any space
                // in layout due to display: none, we gotta
                // make it take some space, while keeping it
                // hidden/invisible and then get dimensions
                tmp_txt_ctn.style.position = 'absolute';
                tmp_txt_ctn.style.visibility = 'hidden';
                tmp_txt_ctn.style.display = 'block';

                var width = tmp_txt_ctn.offsetWidth;
                var height = tmp_txt_ctn.offsetHeight;

                tmp_txt_ctn.style.position = '';
                tmp_txt_ctn.style.visibility = '';
                tmp_txt_ctn.style.display = 'none';

                // Logix
                if (width > parseInt(textarea.style.width)) {
                  break;
                }
              }

              processed_lines.push(tmp_txt_ctn.textContent);
              tmp_txt_ctn.innerHTML = '';
            }


            var fs = SelectedFontSize + "px";
            var ff = SelectedFontFamily;

            DrawText(fs, ff, colorPicked, textarea.style.left, textarea.style.top, processed_lines, true)
            textarea.style.display = 'none';
            textarea.value = '';
            textareaVisible = false;
            //end

            tool.mousemove(ev);
            tool.started = false;

          }
        };

      };

      //Text tool end

      function clearAll_update(trans) {
        redoStack.length = 0;
        undoStack.length = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
        contexto.clearRect(0, 0, canvasWidth, canvasHeight);

        if (!trans) {
          return;
        }

        // socket.emit('Clearboard', {
        //   room: roomName,
        //   CleardrawingBoard: true
        // });
      }

      function onClearAll(data) {
        clearAll_update();
      }

      // socket.on('Clearboard', onClearAll);


      $("#clear-all").click(function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        contexto.clearRect(0, 0, canvasWidth, canvasHeight);
        clearAll_update(true);
        setBackground();
      });


      // The drawing pencil.
      function drawEraser(x0, y0, x1, y1, color, linewidth, emit) {

        contexto.beginPath();
        contexto.globalCompositeOperation = 'destination-out';

        contexto.beginPath();
        contexto.arc(x0, y0, 10, 0, 2 * Math.PI);
        contexto.fill();

        contexto.lineWidth = 20;
        contexto.beginPath();
        contexto.moveTo(x0, y0);
        contexto.lineTo(x1, y1);
        contexto.stroke();


        contexto.closePath();

        if (!emit) {
          return;
        }
        var w = canvasWidth;
        var h = canvasHeight;

        // socket.emit('drawEraser', {
        //   room: roomName,
        //   x0: x0 / w,
        //   y0: y0 / h,
        //   x1: x1 / w,
        //   y1: y1 / h,
        //   color: colorPicked,
        //   lineThickness: lineWidthPicked
        // });
      }

      async function onEraserEvent(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        await drawEraser(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
        contexto.globalCompositeOperation = 'source-over';
      }

      // socket.on('eraser', onEraserEvent);

      tools.eraser = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";
        // This is called when you start holding down the mouse button.
        // This starts the pencil drawing.
        this.mousedown = function (ev) {
          //context.beginPath();
          //context.moveTo(ev._x, ev._y);
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;

        };

        // This function is called every time you move the mouse. Obviously, it only 
        // draws if the tool.started state is set to true (when you are holding down 
        // the mouse button).
        this.mousemove = function (ev) {
          if (tool.started) {
            drawEraser(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
            tool.x0 = ev._x;
            tool.y0 = ev._y;
          }
        };

        // This is called when you release the mouse button.
        this.mouseup = function (ev) {
          // colorPicked = getColor();

          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }

          contexto.globalCompositeOperation = 'source-over';
        };
      };


      //Hexagon
      function drawHexagon(min_x, min_y, abs_x, abs_y, color, linewidth, emit) {
        var side = 0;
        var size = abs_y,
          x = min_x,
          y = min_y;

        context.beginPath();
        context.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

        for (side; side < 7; side++) {
          context.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
        }

        context.fillStyle = "#000000";
        context.stroke();


      }

      function onDrawHexagon(data) {
        var w = canvasWidth;
        var h = canvasHeight;
        drawHexagon(data.min_x * w, data.min_y * h, data.abs_x * w, data.abs_y * h, data.color, data.lineThickness);
      }

      // socket.on('hexagon', onDrawHexagon);


      // The rectangle tool.
      tools.hexagon = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        //above the tool function

        this.mousedown = function (ev) {
          tool.started = true;
          tool.x0 = ev._x;
          tool.y0 = ev._y;
          // getColor();
        };

        this.mousemove = function (ev) {
          colorPicked = selectedColorsArr.hexagon;
          if (!tool.started) {
            return;
          }

          var pos_x = Math.min(ev._x, tool.x0),
            pos_y = Math.min(ev._y, tool.y0),
            pos_w = Math.abs(ev._x - tool.x0),
            pos_h = Math.abs(ev._y - tool.y0);

          context.clearRect(0, 0, canvas.width, canvas.height); //in drawHexagon

          if (!pos_w || !pos_h) {
            return;
          }
          drawHexagon(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
          //context.strokeRect(x, y, w, h); // in drawHexagon
        };

        this.mouseup = function (ev) {
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }
        };
      };


      /* ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
       *    // The line tool.
       * ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
      tools.highlighter = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        this.mousedown = function (e) {
          paths = [];
          tool.started = true;
          isDrawing = true;
          // getColor();
          var pos = getCursorPosition(e);
          paths.push([pos]); // Add new path, the first point is current pos.
        };

        this.mousemove = function (e) {
          if (!isDrawing) return;
          if (!tool.started) {
            return;
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          var pos = getCursorPosition(e);
          paths[paths.length - 1].push(pos); // Append point tu current path.
          drawHighlighter(true);
        };

        this.mouseup = function (ev) {
          isDrawing = false;
          points.length = 0;
          context.globalAlpha = 1;
          if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            img_update(true);
          }

          // socket.emit('drawHighlighter', {
          //   room: roomName,
          //   points: paths,
          //   color: colorPicked,
          //   lineThickness: lineWidthPicked
          // });
        };

      };

      function drawHighlighter(emit = false, socketpoint = [], color = null) {

        // clear canvas
        context.clearRect(0, 0, context.width, context.height);

        if (socketpoint.length) {
          paths = socketpoint;
        }

        for (var i = 0; i < paths.length; ++i) {
          var path = paths[i];

          if (path.length < 1)
            continue;

          if (color)
            context.strokeStyle = color;
          else
            context.strokeStyle = selectedColorsArr.highlighter;;

          context.globalAlpha = .4;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.lineWidth = 15;
          context.beginPath();
          context.moveTo(path[0].x, path[0].y);

          for (var j = 1; j < path.length; ++j)
            context.lineTo(path[j].x, path[j].y);

          context.stroke();

          if (!emit) {
            return;
          }

        }
      }

      /**Get Cursor postion on move **/
      function getCursorPosition(e) {

        return {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top
        };
      }

      /**Function on socket on event **/
      async function onHighlighterEvent(data) {
        await drawHighlighter(false, data.points, data.color);
        context.globalAlpha = 1;
      }
      // socket.on('highlighter', onHighlighterEvent);
      /********************************************************/

      tools.drag = function () {
        var tool = this;
        this.started = false;
        textarea.style.display = "none";
        textarea.style.value = "";

        this.mousedown = function (e) {};

        this.mousemove = function (e) {};

        this.mouseup = function (ev) {};
      }

      /**
       * 
       * @param {*} state 
       * @param {*} undoRedo 
       */
      function saveState(state, undoRedo = false) {
        if (!undoRedo) {
          redoStack.push(state);
        } else {
          masterStack.push(state);
        }
      }
      /**
       * Function for undo 
       * We store canvas image into array with latest image.
       * after that we remove last index from array to undo canvas and set value to redo array as well for redo functionality
       */
      tools.undo = function () {

        if (masterStack.length) {
          var restore_state = masterStack.pop();
          saveState(canvaso.toDataURL(), false);
          var img = document.createElement('img');
          img.setAttribute('src', restore_state);
          img.onload = function () {
            contexto.clearRect(0, 0, canvasWidth, canvasHeight);
            contexto.drawImage(img, 0, 0);
          };
        }
        // socket.emit('undo', {
        //   room: roomName,
        //   data: restore_state
        // });
      }

      function onUndoEvent(data) {
        var restore_state = data.data;

        var img = document.createElement('img');
        img.setAttribute('src', restore_state);
        img.onload = function () {
          contexto.clearRect(0, 0, canvasWidth, canvasHeight);
          contexto.drawImage(img, 0, 0);
        };
      }
      // socket.on('undo', onUndoEvent)

      function onRedoEvent(data) {
        var restore_state = data.data;

        var img = document.createElement('img');
        img.setAttribute('src', restore_state);
        img.onload = function () {
          contexto.clearRect(0, 0, canvasWidth, canvasHeight);
          contexto.drawImage(img, 0, 0);
        };
      }
      // socket.on('redo', onRedoEvent)
      /**
       * Function redo 
       * we get the redo value from redo array 
       * we set undo value to undo array as well
       */
      tools.redo = function () {

        if (redoStack.length) {
          var restore_state = redoStack.pop();
          saveState(restore_state, true);
          var img = document.createElement('img');
          img.setAttribute('src', restore_state);
          img.onload = function () {
            contexto.clearRect(0, 0, canvasWidth, canvasHeight);
            contexto.drawImage(img, 0, 0);
          };
        }
        // socket.emit('redo', {
        //   room: roomName,
        //   data: restore_state
        // });
      }

      init();

      function setBackground(mouseX = 0, mouseY = 0) {
        var c = document.getElementById("imageView");
        var ctx = c.getContext("2d");

        var circleRadius = 1;
        var circleMargin = 16;
        var canvasW = c.width;
        var canvasH = c.height;

        var $canvas = $("#imageView");
        var canvasOffset = $canvas.offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        var circleAmountX = canvasW / (circleRadius + (2 * circleMargin));
        var circleAmountY = canvasH / (circleRadius + (2 * circleMargin));
        ctx.clearRect(0, 0, canvasW, canvasH);

        for (var i = 0; i < circleAmountX + 1; i++) {
          for (var k = 0; k < circleAmountY + 1; k++) {
            var x = i * (circleRadius + circleMargin * 2);
            var y = k * (circleRadius + circleMargin * 2);
            ctx.fillStyle = "#cccccc"
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
          }
        }
      }



      // setTimeout(function () {
      //   setBackground();
      // }, 200)


    }, false);
  }
  //end
})();
