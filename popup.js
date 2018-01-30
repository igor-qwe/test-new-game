document.addEventListener('DOMContentLoaded', () => {
  const globsScripts = saveAs + ";" + [fix/*, copyTextToClipboard*/].reduce((allScripts, scr) => allScripts + scr.toString() + ";", "");

  const script = `
      var txt = document.body.outerHTML;
      var jarrIndex = txt.indexOf("jarr");
      var startIndex = txt.indexOf("{", jarrIndex);
      var endIndex = txt.indexOf("}", startIndex) + 1;
      var bookMarksStr = txt.substring(startIndex, endIndex);
      var bookMarksJson = JSON.parse(bookMarksStr);
      //console.log(bookMarksStr);
      fix(bookMarksJson);
  `;

  chrome.tabs.executeScript({
    code: globParts + ";" + globsScripts + ";" + script
  });
});

////////////////////////////////////////////////// CODE BELOW
const globParts = `
  const header = \`
  <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
      <name><![CDATA[CITY_NAME]]></name>
      <visibility>1</visibility>
      <open>1</open>
      <Snippet><![CDATA[created using <A href="http://www.gpsvisualizer.com/?ref=ge&time=20171012033357">GPS Visualizer</A>]]></Snippet>
  <Style id="gv_waypoint_normal">
      <IconStyle>
      <color>ffffffff</color>
      <scale>1</scale>
      <Icon>
      <href>http://maps.google.com/mapfiles/kml/pal4/icon56.png</href>
  </Icon>
  <hotSpot x="0.5" xunits="fraction" y="0.5" yunits="fraction" />
      </IconStyle>
      <LabelStyle>
      <color>ffffffff</color>
      <scale>1</scale>
      </LabelStyle>
      <BalloonStyle>
      <text><![CDATA[<div style="font-family:Arial,sans-serif; min-width:200px;"><h3>$[name]</h3> <div style="margin-top:8px;">$[description]</div></div>]]></text>
  </BalloonStyle>
  </Style>
  <Style id="gv_waypoint_highlight">
      <IconStyle>
      <color>ffffffff</color>
      <scale>1.2</scale>
      <Icon>
      <href>http://maps.google.com/mapfiles/kml/pal4/icon56.png</href>
  </Icon>
  <hotSpot x="0.5" xunits="fraction" y="0.5" yunits="fraction" />
      </IconStyle>
      <LabelStyle>
      <color>ffffffff</color>
      <scale>1</scale>
      </LabelStyle>
      <BalloonStyle>
      <text><![CDATA[<div style="font-family:Arial,sans-serif; min-width:200px;"><h3>$[name]</h3> <div style="margin-top:8px;">$[description]</div></div>]]></text>
  </BalloonStyle>
  </Style>
  <Style id="gv_track">
      <LineStyle>
      <color>ff0000e6</color>
      <width>4</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[<div style="font-family:Arial,sans-serif; min-width:200px;"><h3>$[name]</h3> <div style="margin-top:8px;">$[description]</div></div>]]></text>
  </BalloonStyle>
  </Style>
  <StyleMap id="gv_waypoint">
      <Pair>
      <key>normal</key>
      <styleUrl>#gv_waypoint_normal</styleUrl>
  </Pair>
  <Pair>
  <key>highlight</key>
  <styleUrl>#gv_waypoint_highlight</styleUrl>
  </Pair>
  </StyleMap>

  <Folder id="Waypoints">
      <name>Waypoints</name>
      <visibility>1</visibility>
  \`;

  const middlePart = \`
  </Folder>

  <Folder id="Tracks">
      <name>Tracks</name>
      <visibility>1</visibility>
      <open>0</open>
  \`;

  const footer = \`
  </Folder>

  </Document>
  </kml>
  \`;`;

function fix (map, name = "") {
  let result = header;

  if (map.pins) {
    map.pins.forEach(point => {
      result += `
  <Placemark>
    <name>${point[2]}</name>
    <Snippet></Snippet>
    <description><![CDATA[&nbsp;]]></description>
    <styleUrl>#gv_waypoint</styleUrl>
    <Point>
    <altitudeMode>clampToGround</altitudeMode>
    <coordinates>${point[1]},${point[0]}</coordinates>
    </Point>
    </Placemark>`;
  });
  }

  result += middlePart;

  if (map.path) {
    const points = [];
    map.path.forEach(loc => points.push(`${loc[1]},${loc[0]},0`));
    result += `
  <Placemark>
    <name><![CDATA[ROUTE]]></name>
    <Snippet></Snippet>
    <description><![CDATA[&nbsp;]]></description>
    <styleUrl>#gv_track</styleUrl>
    <Style>
    <LineStyle>
    <color>ff0000e6</color>
    <width>4</width>
    </LineStyle>
    </Style>
    <MultiGeometry>
    <LineString>
    <tessellate>1</tessellate>
    <altitudeMode>clampToGround</altitudeMode>
    <coordinates>${points.join(" ")}</coordinates>
    </LineString>
    </MultiGeometry>
    </Placemark>`;
  }

  result += footer;

  result = result.replace("CITY_NAME", name);

  //copyTextToClipboard(result);
  var blob = new Blob([result], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "my_places.kml");
}

function copyTextToClipboard (text) {
  const textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  } finally {
    console.log(text);
    document.body.removeChild(textArea);
  }
}


/* FileSaver.js */

var saveAs = `
  var saveAs = saveAs || (function(view) {
        "use strict";
        // IE <10 is explicitly unsupported
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
          return;
        }
        var
            doc = view.document
        // only get URL when necessary in case Blob.js hasn't overridden it yet
            , get_URL = function() {
              return view.URL || view.webkitURL || view;
            }
            , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
            , can_use_save_link = "download" in save_link
            , click = function(node) {
              var event = new MouseEvent("click");
              node.dispatchEvent(event);
            }
            , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
            //, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)/
            , is_chrome_ios =/CriOS\\/[\\d]+/.test(navigator.userAgent)
            , throw_outside = function(ex) {
              (view.setImmediate || view.setTimeout)(function() {
                throw ex;
              }, 0);
            }
            , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            , arbitrary_revoke_timeout = 1000 * 40 // in ms
            , revoke = function(file) {
              var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                  get_URL().revokeObjectURL(file);
                } else { // file is a File
                  file.remove();
                }
              };
              setTimeout(revoker, arbitrary_revoke_timeout);
            }
            , dispatch = function(filesaver, event_types, event) {
              event_types = [].concat(event_types);
              var i = event_types.length;
              while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                  try {
                    listener.call(filesaver, event || filesaver);
                  } catch (ex) {
                    throw_outside(ex);
                  }
                }
              }
            }
            , auto_bom = function(blob) {
              // prepend BOM for UTF-8 XML and text/* types (including HTML)
              // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
              // TODO
              //if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
              //}
              return blob;
            }
            , FileSaver = function(blob, name, no_auto_bom) {
              if (!no_auto_bom) {
                blob = auto_bom(blob);
              }
              // First try a.download, then web filesystem, then object URLs
              var
                  filesaver = this
                  , type = blob.type
                  , force = type === force_saveable_type
                  , object_url
                  , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                  }
              // on any filesys errors revert to saving with object URLs
                  , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                      // Safari doesn't allow downloading of blob urls
                      var reader = new FileReader();
                      reader.onloadend = function() {
                        var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                        var popup = view.open(url, '_blank');
                        if(!popup) view.location.href = url;
                        url=undefined; // release reference before dispatching
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                      };
                      reader.readAsDataURL(blob);
                      filesaver.readyState = filesaver.INIT;
                      return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) {
                      object_url = get_URL().createObjectURL(blob);
                    }
                    if (force) {
                      view.location.href = object_url;
                    } else {
                      var opened = view.open(object_url, "_blank");
                      if (!opened) {
                        // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                        view.location.href = object_url;
                      }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                  }
                  ;
              filesaver.readyState = filesaver.INIT;

              if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                  save_link.href = object_url;
                  save_link.download = name;
                  click(save_link);
                  dispatch_all();
                  revoke(object_url);
                  filesaver.readyState = filesaver.DONE;
                });
                return;
              }

              fs_error();
            }
            , FS_proto = FileSaver.prototype
            , saveAs = function(blob, name, no_auto_bom) {
              return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
            }
            ;
        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
          return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";

            if (!no_auto_bom) {
              blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
          };
        }

        FS_proto.abort = function(){};
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
            FS_proto.onwritestart =
                FS_proto.onprogress =
                    FS_proto.onwrite =
                        FS_proto.onabort =
                            FS_proto.onerror =
                                FS_proto.onwriteend =
                                    null;

        return saveAs;
      }(
          typeof self !== "undefined" && self
          || typeof window !== "undefined" && window
          || this.content
      ));

  if (typeof module !== "undefined" && module.exports) {
    module.exports.saveAs = saveAs;
  } else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
    define("FileSaver.js", function() {
      return saveAs;
    });
  }
`;