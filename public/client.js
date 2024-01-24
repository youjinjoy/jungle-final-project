/**************************/
// 형광펜 메모 그려주는 함수 호출
// drawStoredHighlightsMemo();

/**************************/
// highlight_id를 추적하기 위한 전역 변수
let highlightId = 1;

// 하이라이트 칠해주는 함수
function highlightRange(range) {

  let passNode = false;
  console.log("encestor" , range.commonAncestorContainer.textContent)
  console.log("start", range.startContainer.textContent, "end", range.endContainer.textContent)

  const filterFunction = function(node) {

    if(node.hasChildNodes()){
      return NodeFilter.FILTER_SKIP
    }

    if (node === range.startContainer) {
      passNode = true;
    }
    
    console.log("filtering : ", node.textContent)
    const filterState = passNode ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;

    if (node === range.endContainer) {
      passNode = false;
    }
  
    return filterState
  };

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ALL,
    filterFunction
  );

  let parentElement;

  let currentNode = walker.nextNode()
  while (currentNode){
    const nextNode = walker.nextNode();
    parentElement = currentNode.parentNode;
    console.log("walking", currentNode.textContent)
    
    const marker = document.createElement("mark")
    marker.classList.add("red") // 'yellow' 클래스 추가
    parentElement.replaceChild(marker, currentNode);
    marker.appendChild(currentNode)
    currentNode = nextNode;
  } 
  highlightId++; 
}

// 형광펜 드래그 이벤트 리스너
document.addEventListener('mouseup', () => {
  console.log("mouseup");
  const selectedRange = window.getSelection();

  if (selectedRange.rangeCount > 0 && !selectedRange.isCollapsed) {
    const highlightInfos = []

    for (let i = 0; i < selectedRange.rangeCount; i++) {
      const range = selectedRange.getRangeAt(i);
      // range에 대한 처리...
      // wrapRange(range,"yellow")
      highlightRange(range);

      // 형광펜 정보 저장
      highlightInfos.push({
        text: selectedRange.toString(), // 형광펜 칠해진 글자
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset // 끝 위치
      });
    }
    // 형광펜 정보를 백엔드로 전송
    sendHighlightToServer(highlightInfos);
  }
  selectedRange.removeAllRanges();
  }
);

/**************************/
// 형광펜 정보를 백엔드로 전송하는 함수
function sendHighlightToServer(highlightInfos) {
fetch('/api/save-highlight', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(highlightInfos),
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
