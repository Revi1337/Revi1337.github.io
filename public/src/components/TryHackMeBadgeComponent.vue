<template>
  <div>
    <div id="thm_badge" class="thm_margin" @click="openTryHackMe">
      <div style="width: auto; border-radius: 4px; margin-right: 0px">
        <div
          class="thm_avatar"
          style="
            background-image: url('https://secure.gravatar.com/avatar/890fccd6ac01e013029ae2889d85fa96.jpg?s=200&d=robohash&r=x');
          "
        ></div>
      </div>
      <div
        style="
          margin-left: 25px;
          width: 235px;
          height: 56px;
          background-color: #343c42;
          border-radius: 5px;
          text-align: left;
          background-image: url('https://assets.tryhackme.com/img/thm_logo_only.svg');
          background-size: 23px 23px;
          background-position: right 5px bottom 5px;
          background-repeat: no-repeat;
        "
      >
        <div
          class="thm_font"
          style="
            box-sizing: content-box;
            height: 50px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: 8px;
            padding-top: 5px;
          "
        >
          <p class="thm_line" style="margin-bottom: 3px">
            <span class="thm_nickname">revi1337</span>
            <span class="thm_rank">[0xA][Wizard]</span><br />
          </p>
          <p
            class="thm_line"
            style="margin-bottom: 1px; display: flex; align-items: center"
          >
            <img
              class="thm_icon thm_mr"
              src="https://assets.tryhackme.com/img/badges/trophy.png"
              alt="trophy"
            />
            <!-- <span class="thm_stat thm_mr">18685</span> -->
            <span class="thm_stat thm_mr">{{ userRank }}</span>
            <img
              class="thm_icon thm_mr"
              src="https://assets.tryhackme.com/img/badges/door.png"
              alt="door"
            />
            <span class="thm_stat thm_mr">110</span>
            <img
              class="thm_icon thm_mr"
              src="https://assets.tryhackme.com/img/badges/target.png"
              alt="target"
            />
            <span class="thm_stat">16</span><br />
          </p>
          <p class="thm_line">
            <a href="https://www.tryhackme.com" target="_blank" class="thm_link"
              >tryhackme.com</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const openTryHackMe = () =>
  window.open('https://tryhackme.com/p/revi1337', '_blank');
const props = defineProps({
  userRank: {
    type: Number,
    required: true,
    default: 18685
  }
});
</script>

<style lang="scss" scoped>
.thm_margin {
  margin: 5px;
}
#thm_badge {
  width: 210px;
  display: inline-table;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
#thm_badge:hover {
  cursor: pointer;
}
.thm_avatar {
  display: block;
  width: 50px;
  height: 50px;
  float: left;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border-radius: 50%;
  box-sizing: content-box;
  border: 3px solid #88cc14;
  background-color: #343c42;
  box-shadow: inset 0px 0px 3px 3px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  box-shadow: 0 0px 3px 0px #303030;
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: url('https://fonts.gstatic.com/s/ubuntumono/v6/ViZhet7Ak-LRXZMXzuAfkY4P5ICox8Kq3LLUNMylGO4.woff2')
    format('woff2');
}
.thm_font {
  font-family: 'Roboto', monospace;
}
.thm_nickname {
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  text-shadow: #000 0 0 6px;
}
.thm_stat {
  color: #fff;
  opacity: 0.5;
  font-size: 14px;
}
.thm_icon {
  opacity: 0.85;
  height: 16px;
}
@keyframes flicker {
  0%,
  19.999%,
  22%,
  62.999%,
  64%,
  64.999%,
  70%,
  100% {
    opacity: 0.99;
    text-shadow: -1px -1px 0 var(--box-shadow-color),
      1px -1px 0 var(--box-shadow-color), -1px 1px 0 var(--box-shadow-color),
      1px 1px 0 var(--box-shadow-color), 0 -2px 8px var(--box-shadow-color),
      0 0 2px, 0 0 5px #ff7e00, 0 0 15px #ff4444, 0 0 2px #ff7e00,
      0 2px 3px #000;
  }
  20%,
  21.999%,
  63%,
  63.999%,
  65%,
  69.999% {
    opacity: 0.4;
    text-shadow: none;
  }
}
.thm_rank {
  color: #ffffff;
  font-size: 11px;
}
.thm_line {
  line-height: 12px;
  margin: 0px;
  padding: 0px;
}
.thm_link {
  color: #fff;
  font-size: 0.6em;
  text-decoration: none;
  animation: flicker 6s infinite;
}
.thm_link:hover {
  color: #fff;
  font-size: 0.6em;
  text-decoration: underline;
}
.thm_link:visited {
  color: #fff;
}
.thm_mr {
  margin-right: 8px;
}
.thm_for_img {
  color: #fff;
  opacity: 0.5;
  font-size: 14px;
  position: relative;
  top: -3px;
  margin-bottom: 5px;
}
</style>
