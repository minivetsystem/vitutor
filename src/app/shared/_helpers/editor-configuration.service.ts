import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditorConfigurationService {
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Description',
    imageEndPoint: '',
    toolbar: [
      ['bold', 'italic', 'underline', 'strikeThrough'],
      ['fontName', 'fontSize'],
      [
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
      ],
      ['cut', 'copy', 'delete', 'removeFormat', 'undo', 'redo'],
    ],
  };

  bookingModalEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '120px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Description',
    imageEndPoint: 'upload',
    toolbar: [
      ['bold', 'italic', 'underline', 'strikeThrough'],
      ['fontName', 'fontSize'],
      [
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
      ],
      ['cut', 'copy', 'delete', 'removeFormat', 'undo', 'redo'],
      // ["link", "unlink", "image","pdf"],
    ],
  };
  // constructor() { }
}
