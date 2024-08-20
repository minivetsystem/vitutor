import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { NotifierService } from "angular-notifier";
import Swal from "sweetalert2";
import { AsyncRequestService } from "../../core/services/async-request.service";
import _ from "lodash";
// import { NgxSpinnerService } from "ngx-spinner";
import { constantVariables } from "../../shared/_constants/constants";
import { ModelContentComponent } from "../_components/model-content/model-content.component";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { TooltipPipe } from "../../utils/tooltip.pipe";

@Injectable()
export class AlertService {
  private readonly notifier: NotifierService;
  tooltipValue: any;
  bsModalRef: BsModalRef;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  constructor(
    private router: Router,
    private notifierService: NotifierService,
    private asyncRequestService: AsyncRequestService,
    // private loaderService: NgxSpinnerService,
    private modalService: BsModalService,
    private tooltipPipe: TooltipPipe
  ) {
    this.notifier = notifierService;
    Window["myComponent"] = this;
  }
  //
  readMoreWhyWeRecordSessionsURL: string = "session-recording";
  openReadMoreModal() {
    this.asyncRequestService
      .getRequest(
        "faqs/qus-details/1597060611-what-is-recorded-in-the-session-and-why"
      )
      .subscribe((response: any) => {
        let tooltip: any = response.data.faq_answer;

        if (tooltip == undefined || tooltip == null) {
          tooltip = "content not available.";
        }

        const initialState = {
          content: tooltip,
          title: response.data.faq_question,
        };

        this.bsModalRef = this.modalService.show(ModelContentComponent, {
          initialState,
          class: "modal-lg",
        });
        this.bsModalRef.content.closeBtnName = "Close";
      });
  }
  success(message: string): void {
    this.destroy();
    if (message) return this.notifier.notify("success", message);
  }

  info(message: string): void {
    this.destroy();
    if (message) return this.notifier.notify("info", message);
  }

  error(message: string): void {
    if (message) return this.notifier.notify("error", message);
  }

  destroy() {
    this.notifier.hideAll();
  }

  SwalSuccessAlert(message: string, timer: number): void {
    Swal.fire({
      title: "Success!",
      text: message,
      customClass: {
        container: "success_container_class",
        popup: "success_popup_class",
        header: "success_header_class",
        title: "success_title_class",
        closeButton: "success_close_button_class",
        icon: "success_icon_class",
        image: "success_image_class",
        content: "success_content_class",
        input: "success_input_class",
        actions: "success_actions_class",
        confirmButton: "success_confirm_button_class",
        cancelButton: "success_cancel_button_class",
        footer: "success_footer_class",
      },
      type: "success",
      timer: timer,
      showConfirmButton: false,
    });
  }

  SwalErrorAlert(message: string, timer: number): void {
    Swal.fire({
      title: "Error!",
      text: message,
      customClass: {
        container: "error_container_class",
        popup: "error_popup_class",
        header: "error_header_class",
        title: "error_title_class",
        closeButton: "error_close_button_class",
        icon: "error_icon_class d-none",
        image: "error_image_class",
        content: "error_content_class",
        input: "error_input_class",
        actions: "error_actions_class",
        confirmButton: "error_confirm_button_class",
        cancelButton: "error_cancel_button_class",
        footer: "error_footer_class",
      },
      type: "error",
      showConfirmButton: true,
    });
  }

  SwalInfoAlert(message: string, timer = 1000): void {
    Swal.fire({
      title: "Info!",
      text: message,
      customClass: {
        container: "info_container_class",
        popup: "info_popup_class",
        header: "info_header_class",
        title: "info_title_class",
        closeButton: "info_close_button_class",
        icon: "info_icon_class",
        image: "info_image_class",
        content: "info_content_class",
        input: "info_input_class",
        actions: "info_actions_class",
        confirmButton: "info_confirm_button_class",
        cancelButton: "info_cancel_button_class",
        footer: "info_footer_class",
      },
      type: "info",
      showConfirmButton: true,
    });
  }

  SwalInfoAlertAutoClose(message: string, timer = 1000): void {
    Swal.fire({
      title: "Info!",
      text: message,
      customClass: {
        container: "info_container_class",
        popup: "info_popup_class",
        header: "info_header_class",
        title: "info_title_class",
        closeButton: "info_close_button_class",
        icon: "info_icon_class",
        image: "info_image_class",
        content: "info_content_class",
        input: "info_input_class",
        actions: "info_actions_class",
        confirmButton: "info_confirm_button_class",
        cancelButton: "info_cancel_button_class",
        footer: "info_footer_class",
      },
      type: "info",
      timer: timer,
      showConfirmButton: false,
    });
  }

  SwalWarningAlert(message: string, timer = 1000): void {
    Swal.fire({
      title: "Warning!",
      text: message,
      customClass: {
        container: "warning_container_class",
        popup: "warning_popup_class",
        header: "warning_header_class",
        title: "warning_title_class",
        closeButton: "warning_close_button_class",
        icon: "warning_icon_class",
        image: "warning_image_class",
        content: "warning_content_class",
        input: "warning_input_class",
        actions: "warning_actions_class",
        confirmButton: "warning_confirm_button_class",
        cancelButton: "warning_cancel_button_class",
        footer: "warning_footer_class",
      },
      type: "warning",
      showConfirmButton: true,
    });
  }

  tooltipValueSender(id: number) {
    this.tooltipValue = JSON.parse(localStorage.getItem("tooltipData"));
    let findRow = _.find(this.tooltipValue, { id: id, status: 1 });
    if (findRow != undefined) {
      return (this.tooltipValue = findRow.tooltiptag_description);
    }
  }

  swalVideoPlayer(
    response: any,
    type: string = "course",
    sessionName: any = null
  ): void {
    var videoSrc;
    let typeName = "";
    let typeNameFile = "";
    if (type === "archive") {
      videoSrc = response;
      typeName = sessionName || "Archive";
      typeNameFile = "Recorded";
    } else {
      if (response.overview_video_url) {
        videoSrc = response.overview_video_url;
      } else if (response.overview_video) {
        videoSrc = response.overview_video;
      }

      if (type == "course") {
        typeName = response.course_name;
        typeNameFile = "Course";
      } else {
        typeName = response.full_name;
        typeNameFile = "Profile";
      }
    }

    Swal.fire({
      title: `${typeNameFile} Overview : ${typeName}`,
      html: `<iframe src="${videoSrc}?autoplay=1&loop=2" width="100%" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="autoplay; fullscreen" ></iframe>`,
      showCloseButton: false,
      showConfirmButton: false,
      focusCancel: false,
      backdrop: false,
      customClass: {
        container: "draggable-sweetener",
        title: "videoSwal",
      },
      animation: true,
      // showClass: {
      //   popup: 'animated fadeInDown faster'
      // },
      // hideClass: {
      //   popup: 'animated fadeOutUp faster'
      // }
    });
    let sweetAlert = document
      .getElementsByClassName("draggable-sweetener")[0]
      .setAttribute("id", "draggable");
    this.dragElement(document.getElementById("draggable"));

    let closeButton = document.createElement("button");
    closeButton.className = "swal2-close";
    closeButton.onclick = function () {
      Swal.close();
    };
    closeButton.textContent = "×";
    let modal = document.getElementById("draggable");
    modal.appendChild(closeButton);
  }

  dragElement(elements: any) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (document.getElementById(elements.id)) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elements.id).onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elements.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elements.style.top = elements.offsetTop - pos2 + "px";
      elements.style.left = elements.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  showLoader(): void {
    // this.loaderService.show();
  }
  hideLoader(): void {
    // this.loaderService.hide();
  }

  generate_token_subscriber = "video-streaming/generate-token-subscriber";
  async startOrJoinStream(postData: any, row: any, streamType: string) {
    let responseArr: any;
    await this.asyncRequestService
      .postRequest(this.generate_token_subscriber, postData)
      .subscribe(
        (response: any) => {
          if (response.swal) {
            Swal.fire({
              title: row.session_tokens ? "Join Session" : "Start Session",
              backdrop: true,
              // allowOutsideClick: false,
              html: `${response.success_message}`,
              type: "info",
              customClass: this.swalInfoOption,
              showConfirmButton: true,
              showCancelButton: false,
              confirmButtonText: "Got it. Proceed",
            }).then((result) => {
              const myVideoCanOn = document.getElementById(
                "turn-video-off-on"
              ) as HTMLInputElement;
              const myAudioCanOn = document.getElementById(
                "turn-audio-off-on"
              ) as HTMLInputElement;

              let videoIsOn = "on";
              if (myVideoCanOn && myVideoCanOn.checked) videoIsOn = "off";

              let audioIsOn = "on";
              if (myAudioCanOn && myAudioCanOn.checked) audioIsOn = "off";
              if (result.value) {
                postData.is_confirm = true;
                this.asyncRequestService
                  .postRequest(this.generate_token_subscriber, postData)
                  .subscribe(
                    (response: any) => {
                      responseArr = response;

                      this.joinLink(
                        `/stream/${streamType}/${response.session_token}?video=${videoIsOn}&audio=${audioIsOn}`
                      );
                    },
                    (error) => {
                      this.error(error.error.error_message);
                    }
                  );
              }
            });
          } else {
            this.joinLink(`/stream/${streamType}/${response.session_token}`);
          }
        },
        (error) => {
          this.error(error.error.error_message);
        }
      );

    return responseArr;
  }

  joinLink(link: any) {
    this.router.navigate([]).then(() => {
      window.open(link, "_blank");
    });
  }

  publisherThrowingError(error: string) {
    Swal.fire({
      title: "Let's check this.",
      backdrop: true,
      allowOutsideClick: false,
      html: `${error}`,
      type: "info",
      customClass: this.swalInfoOption,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: "Please, try again",
      cancelButtonText: "okay, exit",
    }).then((result) => {
      if (result.value) {
        window.location.reload();
      } else {
        window.close();
      }
    });
  }

  swalWithoutIcon(message: string) {
    Swal.fire({
      title: "Let's check this.",
      text: message,
      customClass: {
        container: "info_container_class",
        popup: "info_popup_class",
        header: "info_header_class",
        title: "info_title_class",
        closeButton: "info_close_button_class",
        icon: "info_icon_class d-none",
        image: "info_image_class",
        content: "info_content_class",
        input: "info_input_class",
        actions: "info_actions_class",
        confirmButton: "info_confirm_button_class",
        cancelButton: "info_cancel_button_class",
        footer: "info_footer_class",
      },
      type: "info",
      showConfirmButton: true,
      confirmButtonText: "Okay, Got it",
    });
  }
}
