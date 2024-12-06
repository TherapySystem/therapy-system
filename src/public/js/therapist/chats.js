const socket = io(window.location.origin);

const chatArea = document.getElementById(`chat-area`);

let currentChatRoom = null;
let therapistId = ``;
let childId = null;

const loadAllPatients = async (keyword = '') => {
    const fetchPatients = await fetch('/get-all-patients', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchPatients.json();
}

const getMyId = async () => {
    const fetchMyId = await fetch('/get-my-id', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchMyId.json();
}
 
function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

const joinRoom = async (childId2) => {
    setActiveBarItem(childId2);
    childId = childId2;
    currentChatRoom = `${therapistId}_${childId2}`;
    socket.emit('joinRoom', { therapistId, childId: childId2 });
}

const setActiveBarItem = (childId) => {
    const childrenBar = document.getElementById('children-bar');
    const children = childrenBar.children;
    for (var i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id == `item-${ childId }`) {
            child.classList.add('active-bar-item')
            continue;
        }
        child.classList.remove('active-bar-item');
    }
}

const scrollToBottom = () => {
    const chatWindow = document.querySelector('.chat-area');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

const sendMessage = () => {
    const message = document.getElementById('messageInput');
    if (message.value.trim()) {
        socket.emit('sendMessage', { therapistId, childId, message: message.value.trim(), senderId: therapistId });
        message.value = '';
    }
    scrollToBottom();
}

const loadData = async () => {
    showLoadingScreen("Retrieving messages...");

    const myId = await getMyId();
    therapistId = myId.id;

    const childrenBar = document.getElementById('children-bar');
    const allPatients = await loadAllPatients();
    for (var i = 0; i < allPatients.length; i++) {
        const patient = allPatients[i];
        const template = `
            <div id="item-${ patient.id }" class="bar-item">
                <h4>${ patient.childFirstName } ${ patient.childMiddleName } ${ patient.childLastName }</h4>
                <p>...</p>
            </div>`;
        childrenBar.insertAdjacentHTML('beforeend', template);
        const clickableDiv =  document.getElementById(`item-${ patient.id }`);
        clickableDiv.onclick = () => {
            joinRoom(patient.id);
        }
    }

    hideLoadingScreen();
}

const chatTemplate = (message) => {
    const template = `
    <div class="${ message.senderId[0] == 'U' ? 'mine' : 'other' } tooltip">
        ${ message.message }
        <span class="tooltiptext">${ message.timeStamp }</span>
    </div>`;
    
    return template;
}

const loadFunctions = async () => {
    const sendMessageButton = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');

    sendMessageButton.onclick = () => {
        sendMessage();
    }

    messageInput.onkeydown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    }

    socket.on('loadMessages', (messages) => {
        chatArea.innerHTML = ``;

        console.log(messages);

        for (var i = 0; i < messages.length; i++) {
            const message = messages[i];
            chatArea.insertAdjacentHTML('beforeend', chatTemplate(message));
        }

    });

    socket.on('receiveMessage', (message) => {
        chatArea.insertAdjacentHTML('beforeend', chatTemplate(message));
        scrollToBottom();
    });
}

loadData();
loadFunctions();
scrollToBottom();