(()=>{'use strict';
const $=x=>document.getElementById(x),view=$('view'),voice=$('voice');
const cues=[{id:'cue6',time:6,text:'There is a blue cup on the table.',audio:'cue6'},{id:'cue10',time:10,text:'The blue cup rests on a wooden table.',audio:'cue10'}];
const issueNames={detail:'Not enough detail or unclear',accuracy:'Possibly inaccurate'};
const S={task:'t1',view:'home',on:false,sound:true,paused:true,current:'cue6',history:['cue6'],selected:'cue6',returnTime:6,issue:'',note:'',busy:false,saved:false,lastSpoken:null};
const clip=document.createElement('video');clip.id='clip';clip.src='tabletop.mp4';clip.poster='blue-cup.jpg';clip.preload='auto';clip.muted=true;clip.playsInline=true;clip.setAttribute('aria-hidden','true');clip.tabIndex=-1;
const player=document.createElement('div');player.id='player';player.innerHTML=`<p class="kicker">EVERYDAY STORIES</p><h2 tabindex="-1">A quiet moment</h2><div class="video-wrap"><div id="mediaSlot"></div><span class="state-pill" id="playState" aria-hidden="true"></span></div><div class="timeline"><b id="clock">00:06</b><span>00:18</span></div><progress id="progress" max="18" value="6" aria-label="Video progress"></progress><section class="narration" aria-label="Visual narration"><div class="narration-head"><b>VISUAL NARRATION <span id="onState">OFF</span></b><button data-action="toggle" id="narrationToggle" aria-pressed="false">Turn on</button></div><p id="narrationText"></p></section><div class="two-buttons"><button class="button" data-action="playpause" id="playToggle">Pause video</button><button class="button" data-action="history">Recent narrations</button></div><button class="button primary" data-action="details">Hear frame details</button><button class="button" data-action="report">Report narration issue</button><p class="footnote" id="playerHint">Details pause the video. Resume when you choose.</p>`;
player.querySelector('#mediaSlot').append(clip);
const panels=document.createElement('div');panels.id='panels';view.append(player,panels);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>'00:'+String(Math.max(0,Math.floor(t))).padStart(2,'0');
const cue=id=>cues.find(c=>c.id===id)||cues[0];
function status(t){$('live').textContent='';requestAnimationFrame(()=>{$('live').textContent=t;});}
function stopSpeech(){voice.pause();voice.removeAttribute('src');voice.load();if('speechSynthesis'in window)window.speechSynthesis.cancel();}
function error(t){$('errorBanner').hidden=!t;$('errorBanner').textContent=t;}
function sound(name){stopSpeech();if(!S.sound)return;voice.src=''+name+'.m4a';voice.play().catch(e=>{if(e.name!=='AbortError')error('Audio could not play. The same information is available as text. Try the local preview server.');});}
function focus(action){const scope=S.view==='player'?player:panels;const target=action==='chosenIssue'?scope.querySelector('input[name="issue"]:checked'):action?scope.querySelector(`[data-action="${action}"]`):scope.querySelector('h2');if(target)target.focus({preventScroll:true});}
function updatePlayer(){
 if(!player.isConnected)return;
 const current=cue(S.current);player.querySelector('#clock').textContent=fmt(clip.currentTime);player.querySelector('#progress').value=clip.currentTime;
 player.querySelector('#progress').setAttribute('aria-valuetext',`${fmt(clip.currentTime)} of 00:18`);
 player.querySelector('#playState').textContent=S.paused?'PAUSED':'PLAYING';player.querySelector('#playToggle').textContent=S.paused?'Resume playback':'Pause video';
 player.querySelector('#onState').textContent=S.on?'ON':'OFF';const toggle=player.querySelector('#narrationToggle');toggle.textContent=S.on?'Turn off':'Turn on';toggle.setAttribute('aria-pressed',String(S.on));
 const text=player.querySelector('#narrationText');text.textContent=S.on?current.text:'Hear the visual details of this moment.';text.className=S.on?'':'off-copy';
 player.querySelector('#playerHint').textContent=S.paused?`Video is paused at ${fmt(clip.currentTime)}. Resume playback when you choose.`:'Details pause the video. Resume when you choose.';
}
function button(label,act,primary=false,disabled=false){return `<button class="button${primary?' primary':''}" data-action="${act}"${disabled?' disabled':''}>${label}</button>`;}
function quote(c){return `<div class="quote"><p class="timestamp">NARRATION AT ${fmt(c.time)}</p><span class="label">ORIGINAL NARRATION</span><blockquote>“${esc(c.text)}”</blockquote></div>`;}
function pausedInfo(){return `<p class="info-strip">Video stays paused at ${fmt(S.returnTime)}.</p>`;}
function render(action,announce){
 $('soundToggle').textContent='Audio '+(S.sound?'on':'off');$('soundToggle').setAttribute('aria-pressed',String(S.sound));
 player.hidden=S.view!=='player';panels.hidden=S.view==='player';
 if(S.view==='player'){updatePlayer();}
 else if(S.view==='home')panels.innerHTML=`<p class="kicker">MORE CONTEXT. YOUR CONTROL.</p><h2 tabindex="-1">Every story.<br>Within reach.</h2><p class="sub">Visual narration for blind and low-vision short-video viewers.</p><img class="hero-image" src="blue-cup.jpg" alt="A tabletop sample clip"><div class="task-list"><button class="task-card" data-task="t1"><span>01</span><div><b>Hear the moment</b><small>Turn visual narration on</small></div></button><button class="task-card" data-task="t2"><span>02</span><div><b>Look a little closer</b><small>Hear details, then resume</small></div></button><button class="task-card" data-task="t3"><span>03</span><div><b>Make your voice count</b><small>Report an earlier narration</small></div></button></div><p class="home-note">Hear what matters. Take it at your own pace.</p>`;
 else if(S.view==='details')panels.innerHTML=`<p class="kicker">FRAME DETAILS / ${fmt(S.returnTime)}</p><h2 tabindex="-1">A closer look</h2><img class="frame-image" src="blue-cup.jpg" alt="Paused frame from A quiet moment">${pausedInfo()}<dl class="details-list"><div><dt>OBJECT</dt><dd>One blue cup</dd></div><div><dt>POSITION</dt><dd>Center of the table</dd></div><div><dt>DIRECTION</dt><dd>Handle points right</dd></div></dl><p class="detail-tail">Nothing blocks the view behind the cup.</p>${button('Replay frame description','replay',false)}${button('Close details — stay paused','closeDetails',true)}<p class="footnote">Narration stays ${S.on?'on':'off'}. Playback resumes only when you choose.</p>`;
 else if(S.view==='target'||S.view==='history'){
 const reporting=S.view==='target';const latest=S.history[S.history.length-1];
 panels.innerHTML=`<p class="stepper">${reporting?'01 / 03 · CHOOSE NARRATION':'RECENT NARRATIONS'}</p><h2 tabindex="-1">${reporting?'Which narration?':'Listen to a recent line'}</h2><p class="sub">${reporting?'Report the current line or an earlier one.':'Listening here does not move your video.'}</p>${pausedInfo()}<fieldset><legend>Narration to ${reporting?'report':'hear'}</legend>${[...S.history].reverse().map(id=>{const c=cue(id);return `<label class="option"><input type="radio" name="target" value="${c.id}" ${S.selected===id?'checked':''}><span><b>${id===latest?'Current':'Previous'} · ${fmt(c.time)}</b><small>${esc(c.text)}</small></span></label>`;}).join('')}</fieldset>${button('Hear selected narration','listenTarget')}${button(reporting?'Continue to report':'Report this narration','toIssue',true)}${button(reporting?'Cancel and return to video':'Back to video','cancel')}<p class="footnote">The original line and its time will stay visible for review.</p>`;
 }
 else if(S.view==='issue')panels.innerHTML=`<p class="stepper">02 / 03 · DESCRIBE THE ISSUE</p><h2 tabindex="-1">What was the issue?</h2>${quote(cue(S.selected))}<p class="sub">You can report missing detail. You do not need to verify the image or provide a correction.</p><fieldset><legend>Choose one issue</legend><label class="option"><input type="radio" name="issue" value="detail" ${S.issue==='detail'?'checked':''}><span><b>Not enough detail or unclear</b><small>Something you wanted to know was missing.</small></span></label><label class="option"><input type="radio" name="issue" value="accuracy" ${S.issue==='accuracy'?'checked':''}><span><b>Possibly inaccurate</b><small>Report a concern without proving what is correct.</small></span></label></fieldset><label class="field-label" for="note">What would you like to add? <span>(optional)</span></label><textarea id="note" maxlength="300" placeholder="For example: Which way does the handle point?">${esc(S.note)}</textarea><p class="count"><span id="noteCount">${S.note.length}</span> / 300</p>${button('Review report','review',true,!S.issue)}${button('Back to narration selection','backTarget')}<button class="text-link" data-action="cancel">Cancel and return to video</button>`;
 else if(S.view==='review')panels.innerHTML=`<p class="stepper">03 / 03 · REVIEW</p><h2 tabindex="-1">Check your report</h2>${quote(cue(S.selected))}<div class="review-item"><p class="label">ISSUE</p><p>${esc(issueNames[S.issue])}</p></div><div class="review-item"><p class="label">OPTIONAL NOTE</p><p>${S.note.trim()?esc(S.note.trim()):'No additional note.'}</p></div><p class="info-strip" style="margin-top:16px">Reporting ${fmt(cue(S.selected).time)}. Return to your paused video at ${Math.floor(S.returnTime)} seconds.</p>${button('Hear report summary','hearSummary')}${button('Submit report','submit',true)}${button('Edit report','edit')}<button class="text-link" data-action="cancel">Cancel and return to video</button>`;
 else if(S.view==='receipt')panels.innerHTML=`<div class="receipt-icon" aria-hidden="true">${S.saved?'✓':'!'}</div><p class="kicker">${S.saved?'REPORT RECEIVED':'REPORT NOT SAVED'}</p><h2 class="receipt-title" tabindex="-1">${S.saved?'Thank you for<br>speaking up.':'Your report<br>is still here.'}</h2><p class="sub">${S.saved?'Your feedback helps make visual stories more accessible.':'Local storage is unavailable. You can try again or return without saving.'}</p><div class="receipt-panel"><h3>${S.saved?'Awaiting review':'Could not save locally'}</h3><p><b>A quiet moment · ${fmt(cue(S.selected).time)}</b></p><p>${esc(issueNames[S.issue])}</p><p>${S.saved?'This demo saved your report in this browser only. Nothing was sent to a real reviewer.':'No report was saved or sent.'}</p></div>${!S.saved?button('Try saving again','submit',true):''}${button('Return to video — stays paused','return',true)}<p class="footnote">Return to ${fmt(S.returnTime)}. Narration stays ${S.on?'on':'off'}; the reported line has not changed.</p>`;
 focus(action);if(announce)status(announce);
}
async function seekTo(t){
 if(clip.readyState<1)await new Promise((resolve,reject)=>{clip.addEventListener('loadedmetadata',resolve,{once:true});clip.addEventListener('error',reject,{once:true});});
 if(Math.abs(clip.currentTime-t)<.025)return;
 if(!Array.from({length:clip.seekable.length},(_,i)=>[clip.seekable.start(i),clip.seekable.end(i)]).some(([a,b])=>t>=a&&t<=b))throw new Error('Video seeking is unavailable. Open this folder with python3 serve.py, then use the printed local URL.');
 await new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);clip.removeEventListener('seeked',done);resolve();};const timer=setTimeout(()=>{clip.removeEventListener('seeked',done);reject(new Error('Video could not reach this frame. Start the local server with python3 serve.py.'));},2500);clip.addEventListener('seeked',done);clip.currentTime=t;});
}
async function start(task){
 stopSpeech();clip.pause();error('');S.task=task;S.on=task!=='t1';S.paused=true;S.current=task==='t3'?'cue10':'cue6';S.selected=S.current;S.history=task==='t3'?['cue6','cue10']:['cue6'];S.issue='';S.note='';S.returnTime=task==='t3'?10:6;S.lastSpoken=S.current;S.view='player';render();
 await seekTo(S.returnTime);S.paused=false;await clip.play();updatePlayer();status(`Video playing. Narration ${S.on?'on':'off'}.`);if(S.on)sound(S.current);
}
function freeze(){S.returnTime=clip.currentTime;S.paused=true;clip.pause();stopSpeech();}
async function returnPlayer(action,message){clip.pause();await seekTo(S.returnTime);S.paused=true;S.view='player';render(action,message);}
function summary(){return `Report about ${cue(S.selected).time} seconds. Original narration: ${cue(S.selected).text} Issue: ${issueNames[S.issue]}. ${S.note.trim()?'Additional note: '+S.note.trim(): 'No additional note.'} You will return to your paused video at ${Math.floor(S.returnTime)} seconds.`;}
async function act(a){
 if(a==='toggle'){S.on=!S.on;updatePlayer();focus('toggle');status(`Visual narration is ${S.on?'on':'off'}.`);if(S.on){S.lastSpoken=S.current;sound(S.current);}else stopSpeech();return;}
 if(a==='playpause'){
  if(S.paused){await seekTo(S.returnTime);S.paused=false;await clip.play();updatePlayer();focus('playpause');status(`Playback resumed from ${fmt(S.returnTime)}. Narration ${S.on?'on':'off'}.`);if(S.on){S.lastSpoken=S.current;sound(S.current);}}
  else{freeze();updatePlayer();focus('details');sound('paused');status(`Video paused at ${fmt(S.returnTime)}. Hear frame details or resume playback.`);}return;
 }
 if(a==='details'){freeze();if(S.task!=='t3'){S.returnTime=6;await seekTo(6);S.current='cue6';}S.view='details';render('replay',`Video paused at ${fmt(S.returnTime)}. A blue cup is at the center of the table. Its handle points right.`);sound('details');return;}
 if(a==='replay'){sound('details');return;}
 if(a==='closeDetails'){await returnPlayer('playpause','Details closed. Video is still paused. Resume playback when you are ready.');sound('closed');return;}
 if(a==='history'||a==='report'){freeze();S.selected=S.current;S.issue='';S.note='';S.view=a==='history'?'history':'target';render(null,`Video paused at ${fmt(S.returnTime)}. Choose a narration.`);return;}
 if(a==='listenTarget'){sound(S.selected);status(`Narration at ${fmt(cue(S.selected).time)}. ${cue(S.selected).text} Video stays paused.`);return;}
 if(a==='toIssue'){S.view='issue';render(null,`Reporting narration at ${fmt(cue(S.selected).time)}. Choose an issue. Adding a note is optional.`);return;}
 if(a==='backTarget'){S.view='target';render(null,'Choose a narration. Your issue and note are retained.');return;}
 if(a==='review'){if(!S.issue)return;stopSpeech();S.view='review';render('submit',summary());return;}
 if(a==='edit'){stopSpeech();S.view='issue';render('chosenIssue','Edit report. Your issue and optional note are retained.');return;}
 if(a==='hearSummary'){
  stopSpeech();if(!S.sound){status(summary());return;}
  if(!('speechSynthesis'in window)){error('Spoken readback is unavailable in this browser. The complete summary is shown above for your screen reader.');return;}
  const u=new SpeechSynthesisUtterance(summary());u.lang='en-US';u.rate=1;u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))error('Spoken readback could not start. The complete summary is shown as text.');};window.speechSynthesis.speak(u);status('Reading your report summary.');return;
 }
 if(a==='submit'){
  stopSpeech();S.saved=false;try{const key='syncast-final-reports',data=JSON.parse(localStorage.getItem(key)||'[]');data.push({clip:'A quiet moment',narrationTime:cue(S.selected).time,original:cue(S.selected).text,issue:S.issue,issueLabel:issueNames[S.issue],note:S.note.trim(),returnTime:S.returnTime,status:'awaiting review',createdAt:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(data));S.saved=true;}catch{}
  S.view='receipt';render('return',S.saved?'Report received. Awaiting review. Your video stays paused.':'Report could not be saved in this browser. No report was sent.');if(S.saved)sound('submitted');return;
 }
 if(a==='return'||a==='cancel'){stopSpeech();await returnPlayer(a==='return'?'playpause':'report',`Returned to video, still paused at ${fmt(S.returnTime)}. Narration ${S.on?'on':'off'}.`);return;}
}
async function run(fn){if(S.busy)return;S.busy=true;try{await fn();}catch(e){S.paused=true;clip.pause();stopSpeech();updatePlayer();error(e.message||'The media could not open. Please use the local preview server.');status('Media unavailable. Read the opening instructions above.');}finally{S.busy=false;}}
function home(){freeze();S.view='home';render(null,'Choose one of three tasks to start.');}
document.addEventListener('click',e=>{const task=e.target.closest('[data-task]');if(task){run(()=>start(task.dataset.task));return;}const b=e.target.closest('[data-action]');if(b&&!b.disabled)run(()=>act(b.dataset.action));});
document.addEventListener('change',e=>{if(e.target.name==='target'){S.selected=e.target.value;status(`Selected narration at ${fmt(cue(S.selected).time)}. ${cue(S.selected).text}`);}if(e.target.name==='issue'){S.issue=e.target.value;const b=view.querySelector('[data-action="review"]');if(b)b.disabled=false;status(issueNames[S.issue]+' selected. Review report is available.');}});
document.addEventListener('input',e=>{if(e.target.id==='note'){S.note=e.target.value;$('noteCount').textContent=S.note.length;}});
for(const id of ['brand','reset','homeBrand','homeButton'])$(id).addEventListener('click',e=>{e.preventDefault();home();});
$('soundToggle').onclick=()=>{S.sound=!S.sound;stopSpeech();$('soundToggle').textContent='Audio '+(S.sound?'on':'off');$('soundToggle').setAttribute('aria-pressed',String(S.sound));status('Demo audio '+(S.sound?'on':'off')+'.');};
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(S.view==='details'){e.preventDefault();run(()=>act('closeDetails'));}else if(['target','issue','review','history'].includes(S.view)){e.preventDefault();run(()=>act('cancel'));}});
clip.addEventListener('timeupdate',()=>{const current=clip.currentTime>=10?'cue10':'cue6';S.current=current;if(!S.history.includes(current))S.history.push(current);updatePlayer();if(S.on&&!S.paused&&S.lastSpoken!==current){S.lastSpoken=current;sound(current);}});
clip.addEventListener('ended',()=>{S.paused=true;S.returnTime=6;updatePlayer();status('Video ended. Choose Resume playback to watch again from the study frame.');});
render(null,'Choose one of three tasks to start.');
})();
