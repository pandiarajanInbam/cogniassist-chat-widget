import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import './chatwidget.css';
import updateArrow from './assets/update-arrow.png'

import ChatBubble from './components/chatbubble';


class ChatWidget extends Component {
  constructor() {
    super();
    this.state={
      sender_id: this.createOrRetriveSenderId(),
      userMessage: '',
      conversation: [],
      quick_replies:[]
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendText = this.sendText.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

    this.messages=[
      [
        {
            "text": "Welcome to Cogniwide ",
        },
        {
            "text": " How can i help you ?",
        }
      ],
      [
        {
            "text": "Cogniwide specialises in AI powered enterprise products.",
            "buttons": [
                {
                    "title": "CogniAssist",
                    "payload": "CogniAssist"
                },
                {
                    "title": "CogniMLASS",
                    "payload": "CogniMLASS"
                }
            ]
        }
      ],
      [
        {
          "text":"Do you want to continue ?",
          "quick_replies":[{
            "title": "CogniAssist",
            "payload": "CogniAssist"
        },
        {
          "title": "CogniMLASS",
          "payload": "CogniMLASS"
      }]
        }
      ],      [
        {
            "text": "Welcome to Cogniwide ",
        },
        {
            "text": " How can i help you ?",
        }
      ]
      ]


  }
  createOrRetriveSenderId() {
    return "default"
  }

  componentDidMount() {

    $(".chat_box_container").hide();
    $('.left').hide();
    $('.right').hide();
    $('.panel-footer').show();
    $('.left.initial_show').show(450);
    $('.close').click(function () {
        $('.chat_box_container').hide(1000).removeClass('chat_box_active');
    });

    $('.see_next').click(function () {
        $('li:eq(1)').show(300);
        setTimeout(function () { $('li:eq(2)').show(2000); }, 2000);

    });

    $('.chat_btn_container').click(function () {
        $(".chat_box_container").show(100).toggleClass('chat_box_active');
    });

    $('.see_all').click(function () {
        $('.left,.right').show(1000);
        $('.panel-footer').show(2000);
    });


    $(".panel-body").scroll(function () {
        // declare variable
        var topPos=$(this).scrollTop();
        if (topPos>50) {
            $(".panel-heading ").addClass("shaddow");

        } else {
            $(".panel-heading").removeClass("shaddow");
        }

    });


  $(".mic-btn").click(()=> 
	{
		$(".textInput").focus();
	    if (window.hasOwnProperty('webkitSpeechRecognition')) {    
        $(".mic-btn").css({opacity : 1})
        var SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition;
	      var recognition=new SpeechRecognition();
	 
	      recognition.continuous=false;
	      recognition.interimResults=false;
	 
	      recognition.lang="en-IN";
	      recognition.start();
	 
	      recognition.onresult=(e)=>{
            recognition.stop();
            $(".mic-btn").css({opacity : .6})
            console.log(e.results)
            // set text
	        setTimeout(this.sendText(e.results[0][0].transcript), 1000);
	      };
	 
	      recognition.onerror=function(e) {
	        recognition.stop();
	      }
	 
	    }
  });
  
  /* 1. Visualizing things on Hover - See next part for action on click */
$(document).on("mouseover", "#stars li", function (e) {
  var onStar=parseInt($(this).data('value'), 10); // The star currently mouse on
 
  // Now highlight all the stars that's not after the current hovered star
  $(this).parent().children('li.star').each(function(e){
    if (e < onStar) {
      $(this).addClass('hover');
    }
    else {
      $(this).removeClass('hover');
    }
  });
  
}).on('mouseout', function(){
  $(this).parent().children('li.star').each(function(e){
    $(this).removeClass('hover');
  });
});


    /* 2. Action to perform on click */

    $(document).on("click", "#stars li", function (e) {
      var onStar=parseInt($(this).data('value'), 10); // The star currently selected
      var stars=$(this).parent().children('li.star');
      
      for (let i=0; i < stars.length; i++) {
        $(stars[i]).removeClass('selected');
      }
      
      for (let i=0; i < onStar; i++) {
        $(stars[i]).addClass('selected');
      }
      
      // JUST RESPONSE (Not needed)
      var ratingValue=parseInt($('#stars li.selected').last().data('value'), 10);
      var ratingMsg="";
      if (ratingValue > 2) {
        ratingMsg="Thanks! I'm glad we could help you";
      }
      else {
        ratingMsg="Sorry,We will improve ourselves.";
      }
      const msg={
        text: ratingMsg,
        user: 'ai',
      };

      this.setState({
        conversation: [...this.state.conversation, msg],
      });
      
    });

    this.sendRequest("/default/welcome")
  }

              
   scrollToBottom() {
    $(".panel-body").stop().animate({ scrollTop: $(".panel-body")[0].scrollHeight}, 1000);
  }

  handleChange(event){
    this.setState({ userMessage: event.target.value });
  };

  handleSubmit(e){
    if (e.key==='Enter') {
      event.preventDefault();
      if (!this.state.userMessage.trim()) return;
      this.sendText()

    }
  };


  sendText(message=null){
    message = (message==null)?this.state.userMessage:message
    const msg={
      text: message,
      user: 'human',
    };

    this.setState((prevState) => ({
      conversation: [...prevState.conversation, msg],
    }));
    
    this.sendRequest(message)
    this.setState({ userMessage: '' });
    this.scrollToBottom()
  }


  sendRequest(query=null){

    let payload={
      sender: this.state.sender_id,
    }
    if(query==null){
      payload["message"]= this.state.userMessage;
    }else{
      payload["message"]= query;
    }

    let dummyResponse = this.dummyRequest()
    this.renderResponse(dummyResponse);

    // fetch('http://localhost:8080/webhooks/rest/webhook', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // })
    // .then(response=> response.json())
    // .then(response=> {
    //   console.log(response)
    //   this.renderResponse(response)

    // });

  }

  renderResponse(responses){
    let messages =[]
    let quick_replies =[]
    responses.forEach(response=>{
      const msg={
        ...response,
        "user":"ai"
      };
      if ("quick_replies" in response)
      {
        quick_replies.push(...response["quick_replies"]) 
      }
      messages.push(msg)
    })

    this.setState((prevState) => ({
      conversation: [...prevState.conversation, ...messages],
      quick_replies: quick_replies
    }));

    this.scrollToBottom()
  }


  dummyRequest(){
  
    return this.messages.shift()
  }


  render() {
    const chat=this.state.conversation.map((e, index)=>
     <ChatBubble parent={this} message={e}  index={index}  key={index} user={e.user}/>
    );

    const restartStyle={
      width: '20px',
      marginTop:'3px'
    };

    const closeBtnStyle={
      width: '20px'
    }
    return (
      <div>
          <div className="chat_btn_container position-fixed">
              <button className="btn btn-primary border-25 border-0">XYZ Virtual Assistant</button>
          </div>
          <div className="chat_box_container position-relative">
              <div className="col-md-12 p-0 h-100">
                  <div className="panel panel-primary">
                      <div className="panel-heading d-flex justify-content-between align-items-center px-2 bg-primary">
                          <span className="text-white font-weight-bold"> XYZ Virtual Assistant</span>
                          <div className="btn-group pull-right">
                              <a href="#!" className="restart" style={restartStyle}>
                                  <img src={updateArrow} alt="refresh" className="img-responsive" width="15"/>
                              </a>
                              <button type="button" className="close" aria-label="Close" style={closeBtnStyle}>
                                  <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                      <path
                                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                                      </path>
                                  </svg>
                              </button>
                          </div>
                      </div>
                      <div className="panel-body">
                          <ul className="chat">
                            {chat}
                          </ul>
                      </div>
                      <div className="panel-footer position-fixed">
                          <div className="suggestion_box bg-white">
                              <div className="d-flex flex-row quick-replies">
                              {this.state.quick_replies.map((button,index)=> <button type="button" id="quick_reply_btn" key={index}
                               className="btn btn-outline-info text-left mx-2 see_all pl-4 bg-white"
                               onClick={()=> this.sendText(button.title)}
                               data={button}>{button.title}</button>
)} 
                              </div>
                          </div>
                          <div id="composer"
                              className="composer d-flex justify-content-between align-items-center position-relative">
                                <textarea 
                                  value={this.state.userMessage}
                                  onKeyUp={this.handleSubmit}
                                  onChange={this.handleChange}
                                  id="textInput" 
                                  className="textInput" 
                                  placeholder="Type an answer"
                                  ></textarea>
                              <pre className="send-button text-white"></pre>
                              <pre className="mic-btn text-white"></pre>
                          </div>
                      </div>
                  </div>
              </div>
              </div>
          </div>
    );
  }
}
export default ChatWidget;