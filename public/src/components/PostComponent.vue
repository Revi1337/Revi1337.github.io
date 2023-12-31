<template>
  <q-card
    dark
    :class="['card', 'q-ma-sm', isHovered ? 'hovered' : '']"
    :style="{
      width: width,
      height: height,
      borderRadius: '7px',
      boxShadow: shadow ? postData.shadow : 'none',
      padding: '15px',
      border: border ? `1px solid grey` : 'none'
    }"
    @mouseenter="mouseEnter()"
    @mouseleave="mouseLeave()"
    @click="goPostDetails"
  >
    <slot
      :svg-link="postData.link"
      :time-to-read="getPredictedTimeToRead"
      :content="getContent"
    >
      <div class="column" style="height: 100%">
        <div class="col-auto">
          <div class="flex flex-center">
            <span class="text-overline text-red">
              {{ category.toUpperCase() }}
            </span>
            <span>&nbsp;·&nbsp;</span>
            <span :class="`text-${postData.label}`">
              {{ postData.label }}
            </span>
          </div>

          <div class="text-center">
            <q-avatar size="60px">
              <q-img width="45px" :src="postData.link" />
            </q-avatar>
          </div>
        </div>

        <div class="col">
          <div class="row items-center justify-center no-wrap">
            <div style="height: 80px">
              <div class="title text-center">
                {{ title.match(/\[([^\]]+)\]/)[0] }}
              </div>
              <div class="title text-center">
                {{ title.replace(title.match(/\[([^\]]+)\]/)[0] + ' ', '') }}
              </div>
            </div>
          </div>

          <div class="row justify-center items-center">
            <span v-for="tag in props.hashtag" :key="tag" class="q-mx-xs">
              <q-badge rounded outline :color="tag" :label="tag" />
            </span>
          </div>
        </div>
        <div class="vertical-text q-pa-sm absolute-bottom-right">
          {{ props.createdAt }}
        </div>
      </div>
    </slot>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isHovered = ref(false);
const mouseEnter = () => {
  isHovered.value = !isHovered.value;
  emit('mouseEnter', props.folder, props.filename);
};
const mouseLeave = () => {
  isHovered.value = !isHovered.value;
  emit('mouseLeave');
};

const emit = defineEmits(['forwardPost', 'mouseEnter', 'mouseLeave']);

const props = defineProps({
  id: {
    type: Number,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  hashtag: {
    type: Array[String],
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true
  },
  shadow: {
    type: Boolean,
    required: false,
    default: true
  },
  border: {
    type: Boolean,
    required: false,
    default: true
  },
  folder: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    requried: true
  },
  width: {
    type: String,
    required: false,
    default: '270px'
  },
  height: {
    type: String,
    required: false,
    default: '270px'
  }
});

// GotoPostDetails
const goPostDetails = () => {
  const hashtagData = {};
  props.hashtag.forEach((value, index) => {
    hashtagData[index] = { tag: value, tagColor: value };
  });
  console.log(hashtagData);

  $q.localStorage.set('title', props.title);
  $q.localStorage.set('hashtag', hashtagData);
  $q.localStorage.set('createdAt', props.createdAt);
  emit('forwardPost', props.folder, props.filename);
};

// Parsing Datetime
const date = new Date(props.createdAt);
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const hours = String(date.getHours()).padStart(2, '0');
const minutes = String(date.getMinutes()).padStart(2, '0');
const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

// Manipulize Props Data
const getContent = computed({
  get: () => props.content.slice(0, 80)
});
const getPredictedTimeToRead = computed({
  get: () => {
    const predictedTime = Math.floor(props.content.split('\n').length / 40);
    return predictedTime === 0
      ? '1 min to read'
      : `${predictedTime} min to read`;
  }
});

const postData = computed(() => {
  const returnObject = {
    shadow: 'none',
    link: 'Unknown',
    color: 'Unknown',
    label: 'Unknown'
  };
  if (props.hashtag[0] === 'Spring') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #6cb52d, 0 0 11px #6cb52d, 0 0 25px #6cb52d, 0 0 45px #6cb52d'
      : 'none';
    returnObject.link = 'assets/Spring.svg';
    returnObject.color = 'Spring';
    returnObject.label = 'Spring';
  } else if (props.hashtag[0] === 'Vue') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #42b883, 0 0 11px #42b883, 0 0 25px #42b883, 0 0 45px #42b883'
      : 'none';
    returnObject.link = 'assets/Vue.svg';
    returnObject.color = 'Vue';
    returnObject.label = 'Vue';
  } else if (props.hashtag[0] === 'Python') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #3d7daf, 0 0 11px #3d7daf, 0 0 25px #3d7daf, 0 0 45px #3d7daf'
      : 'none';
    returnObject.link = 'assets/Python.svg';
    returnObject.color = 'Python';
    returnObject.label = 'Python';
  } else if (props.hashtag[0] === 'Bash') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #fefefe, 0 0 11px #fefefe, 0 0 25px #fefefe, 0 0 45px #fefefe'
      : 'none';
    returnObject.link = 'assets/Bash.svg';
    returnObject.color = 'Bash';
    returnObject.label = 'Bash';
  } else if (props.hashtag[0] === 'Java') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #b07219, 0 0 11px #b07219, 0 0 25px #b07219, 0 0 45px #b07219'
      : 'none';
    returnObject.link = 'assets/Java.svg';
    returnObject.color = 'Java';
    returnObject.label = 'Java';
  } else if (props.hashtag[0] === 'JavaScript') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #f1e05a, 0 0 11px #f1e05a, 0 0 25px #f1e05a, 0 0 45px #f1e05a'
      : 'none';
    returnObject.link = 'assets/JavaScript.svg';
    returnObject.color = 'JavaScript';
    returnObject.label = 'JavaScript';
  } else if (props.hashtag[0] === 'Quasar') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #00b4ff, 0 0 11px #00b4ff, 0 0 25px #00b4ff, 0 0 45px #00b4ff'
      : 'none';
    returnObject.link = 'assets/Quasar.svg';
    returnObject.color = 'Quasar';
    returnObject.label = 'Quasar';
  } else if (props.hashtag[0] === 'HackTheBox') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #9fef00, 0 0 11px #9fef00, 0 0 25px #9fef00, 0 0 45px #9fef00'
      : 'none';
    returnObject.link = 'assets/HackTheBox.svg';
    returnObject.color = 'HackTheBox';
    returnObject.label = 'HackTheBox';
  } else if (props.hashtag[0] === 'TryHackMe') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #ff0000, 0 0 11px #ff0000, 0 0 25px #ff0000, 0 0 45px #ff0000'
      : 'none';
    returnObject.link = 'assets/TryHackMe.svg';
    returnObject.color = 'TryHackMe';
    returnObject.label = 'TryHackMe';
  } else if (props.hashtag[0] === 'AWS') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #ff9a00, 0 0 11px #ff9a00, 0 0 25px #ff9a00, 0 0 45px #ff9a00'
      : 'none';
    returnObject.link = 'assets/AWS.svg';
    returnObject.color = 'AWS';
    returnObject.label = 'AWS';
  } else if (props.hashtag[0] === 'Docker') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #2291E6, 0 0 11px #2291E6, 0 0 25px #2291E6, 0 0 45px #2291E6'
      : 'none';
    returnObject.link = 'assets/Docker.svg';
    returnObject.color = 'Docker';
    returnObject.label = 'Docker';
  } else if (props.hashtag[0] === 'Jenkins') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #2F4F61, 0 0 11px #2F4F61, 0 0 25px #2F4F61, 0 0 45px #2F4F61'
      : 'none';
    returnObject.link = 'assets/Jenkins.svg';
    returnObject.color = 'Jenkins';
    returnObject.label = 'Jenkins';
  } else if (props.hashtag[0] === 'Git') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #F05030, 0 0 11px #F05030, 0 0 25px #F05030, 0 0 45px #F05030'
      : 'none';
    returnObject.link = 'assets/Git.svg';
    returnObject.color = 'Git';
    returnObject.label = 'Git';
  }
  return returnObject;
});
</script>

<style lang="scss" scoped>
span {
  display: block;
}

.vertical-text {
  // writing-mode: vertical-rl;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  font-size: 1px;
}

.card {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--box-shadow-color);
  }
}
.title {
  font-size: 18px;
  font-weight: 900;
}
</style>
