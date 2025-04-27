import {useRef} from "react";

interface EmailIframeProps {
  html: string;
}

export default function EmailIframe(props: EmailIframeProps) {
  const {html: content} = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">
          <style>
            body {
                padding: 0; margin: 0; font-family: "Inter", sans-serif; font-size: 12px !important;
                /* Text color could be here */
            }
            html{
              overflow-y: hidden;
              height: max-content;
            }
            p, h1, h2, h3, h4, h5 {
              margin-block: 4px;
            }
            ul, ol{
              padding-left: 24px;
              margin: 0;
            }
            li {
              padding-block: 2px;
            }
            ::-webkit-scrollbar {
              width: 5px;
              height: 5px;
            }
            table{
              background-color: hsl(var(--background)) !important;
            }
            table tbody, tr, td {
              border-color: #27272a !important;
              span{
                color: hsl(var(--background));
              }
            }
            ::-webkit-scrollbar-track {
              border-radius: 10px;
            }               
            ::-webkit-scrollbar-thumb {
              background-color: rgba(229, 231, 232, 0.80);
              border-radius: 10px;
            }
            .light-theme * {
              color: #000 !important;
            }
            .dark-theme * {
              color: #fff !important;
            }
          </style>`
        + (content || '')
      }
      style={{display: 'block', width: '100%', border: "none", height: 0}}
      onLoad={() => {
        if (iframeRef.current) {
          iframeRef.current.style.height = iframeRef.current.contentWindow?.document.documentElement.scrollHeight + 'px';
          const iframeDocument = iframeRef.current.contentWindow?.document;
          if (iframeDocument) {
            const images = iframeDocument.querySelectorAll('img');
            for (let img of images) {
              if (img.src.startsWith('cid:')) {
                // TODO: handle CID image attachments
                // const imageCid = img.src.split(':').pop();
                // const attachment = props.attachments.find(a => a.cid === imageCid);
                // if (attachment) {
                //   img.src = attachment.url;
                // }
              }
            }
            const spans = iframeDocument.querySelectorAll('span');
            spans.forEach((span) => {
              const spanBgColor = window.getComputedStyle(span).backgroundColor;
              const spanColor = window.getComputedStyle(span).color;
              if (spanBgColor !== 'rgba(0, 0, 0, 0)' && spanBgColor !== 'transparent') {
                span.style.backgroundColor = 'yellow';
              }
              if (spanColor !== 'rgb(27, 166, 123)' && !span.closest('a')) {
                span.style.color = '#000000';
              }
            });
          }
        }
      }}
    />
  )
}
