/**************************/
// 형광펜 텍스트 그려주는 함수 호출
drawTextContainerFromServer();

// 형광펜 메모 그려주는 함수 호출
drawStoredHighlightsMemo();

/**************************/
// highlight_id를 추적하기 위한 전역 변수
let highlightId = 1;

// 하이라이트 칠해주는 함수
function highlightRange(range) {
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodes = [];
  while (walker.nextNode()) {
    const currentNode = walker.currentNode;
    if (range.intersectsNode(currentNode)) {
      nodes.push(currentNode);
    }
  }

  nodes.forEach(node => {
    const span = document.createElement('span');
    // span.className = 'highlight';
    span.style.backgroundColor = 'yellow'; // 형광펜 효과
    node.parentNode.replaceChild(span, node);
    span.appendChild(node);
  });
}

// 형광펜 드래그 이벤트 리스너
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection();

  if (selectedText.rangeCount > 0 && !selectedText.isCollapsed) {
    const range = selectedText.getRangeAt(0);
    highlightRange(range);

    const text = selectedText.toString();
    const start = selectedText.getRangeAt(0).startOffset;
    const end = selectedText.getRangeAt(0).endOffset;
  
    console.log("selectedText: ", text);
    console.log("startOffset: ", start);
    console.log("endOffset: ", end);
  }

  /**/
  // 형광펜 효과 적용
  if (!selectedText.isCollapsed) {
  const range = selectedText.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = 'yellow'; // 형광펜 효과
  range.surroundContents(span);

  span.setAttribute('highlight_id', highlightId);
  highlightId++; // 다음 highlight_id를 위해 증가

  // 드래그가 끝나고 마우스 버튼을 떼었을 때 드래그 효과를 해제
  selectedText.removeAllRanges();
  }

  // 형광펜 정보 저장
  const highlightInfo = {
    text: text, // 형광펜 칠해진 글자 
    startOffset: start, // 시작 위치
    endOffset: end, // 끝 위치
    // 추가 정보 (예: 페이지 식별자, 위치 등)
  };

  // 형광펜 정보를 백엔드로 전송
  sendHighlightToServer(highlightInfo);
  drawStoredHighlightsMemo();
  sendBodyContentToServer();
  drawTextContainerFromServer();

  }
);

/**************************/
// 형광펜 정보를 백엔드로 전송하는 함수
function sendHighlightToServer(highlightInfo) {
fetch('/api/save-highlight', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(highlightInfo),
});
}

/**************************/
// 형광펜 하나를 지워주는 함수
function deleteOneHighlight(id) {
console.log("delete one test *** id : ", id);
fetch('/api/delete-one-highlight', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
   },
   body: JSON.stringify({ id: id }),
  })
  .then(response => {
    if (response.ok) {
      alert('일부 데이터가 삭제되었습니다.');
      drawStoredHighlightsMemo();
      // 필요한 경우 여기서 추가적인 UI 업데이트 로직을 수행할 수 있습니다.
    }
  })
  .catch(error => console.error('Error:', error));
}

/**************************/
// 저장된 하이라이트 메모 형식으로 보여주는 함수
function drawStoredHighlightsMemo() {
  fetch('/api/find-highlights')
    .then(response => {
      return response.json();
    })
    .then(highlights => {
      const container = document.getElementById('stored-highlights');
      container.innerHTML = '';
      highlights.forEach(highlight => {

        // 저장된 하이라이트 메모 형식으로 보여주는 부분
        const div = document.createElement('div');
        div.style.border = '1px solid black';
        div.style.padding = '10px';
        div.textContent = "- 저장된 부분: "+highlight.text; // 'text'는 데이터베이스에 저장된 필드
        div.setAttribute('id', highlight._id);
        container.appendChild(div);
        
        // 하이라이트 메모 형식 일부 삭제 버튼
        const deleteOneButton = document.createElement('button');
        deleteOneButton.textContent = '일부 삭제';
        deleteOneButton.style.margin = '10px';
        deleteOneButton.addEventListener('click', () => {
          deleteOneHighlight(highlight._id);
        });
        div.appendChild(deleteOneButton); 
      });

    })
    .catch(error => console.error('Error:', error));
  }


/**************************/
// 하이라이트 텍스트 정보 서버에 보내는 함수
async function sendBodyContentToServer() {
    
    // 'text-container' 요소의 내용을 캡처합니다.
    const textContainer = document.getElementById('text-container');
    const textContainerContent = textContainer.innerHTML;

    console.log(textContainerContent);

    /*
    const divs = document.querySelectorAll('div');

    // 각 div 요소를 순회하면서 클래스 이름을 검사합니다.
    divs.forEach(div => {
      // 클래스 리스트에서 'y'로 시작하는 클래스를 찾습니다.
      if (Array.from(div.classList).some(className => className.startsWith('y'))) {
        // 새 div 요소를 생성하고 텍스트를 추가합니다.
        const newDiv = document.createElement('div');
        newDiv.textContent = div.textContent;
      }
    });
    */
    try {
      const response = await fetch('/api/save-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: textContainerContent })
      });
  
      if (response.ok) {
        console.log('내용이 서버로 성공적으로 전송되었습니다.');
      } else {
        console.error('서버로의 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
}

/**************************/
// 하이라이트 텍스트 정보 클라이언트로 다시 가져오는 함수
async function drawTextContainerFromServer() {
  try {
    const response = await fetch('/api/get-text');
    const { html } = await response.json();

    const textContainer = document.getElementById('text-container');
    textContainer.innerHTML = html.html;
  } catch (error) {
    console.error('Error:', error);
  }
}

/**************************/
// 하이라이트 텍스트 하나 찾는 함수
function findOneHighlightText(id) {
  
}



/**************************/
// 하이라이트 메모 하나 찾는 함수
function findOneHighlight(id) {
fetch('/api/find-one-highlight', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: id }),
})
.then(response => {
  return response.json();
})
.then(highlight => {
  console.log('highlight: ', highlight);
})
.catch(error => console.error('Error:', error));
}

/**************************/
// 모두 삭제 버튼 이벤트 핸들러
document.getElementById('deleteAllButton').addEventListener('click', function() {
if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
  fetch('/api/delete-highlights', { method: 'POST' })
    .then(response => {
      if (response.ok) {
        alert('모든 데이터가 삭제되었습니다.');
        drawOriginalTextContainerFromServer();
        drawStoredHighlightsMemo();
        // 필요한 경우 여기서 추가적인 UI 업데이트 로직을 수행할 수 있습니다.
      }
    })
    .catch(error => console.error('Error:', error));
}
});
