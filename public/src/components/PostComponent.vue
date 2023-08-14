<template>
  <!-- :class="{ hovered: isHovered }"
    :style="{ boxShadow: getBoxShadowColor, minHeight: '100px', padding: '15px'}" -->
  <!-- boxShadow: shadow ? getBoxShadowColor : 'none', -->
  <article
    :class="{ hovered: isHovered }"
    :style="{
      boxShadow: shadow ? postData.shadow : 'none',
      minHeight: '100px',
      padding: '15px',
      border: border ? '1px solid' : 'none'
    }"
    @click="goPostDetails()"
    @mouseenter="slideSwitch()"
    @mouseleave="slideSwitch()"
  >
    <slot
      :svg-link="postData.link"
      :time-to-read="getPredictedTimeToRead"
      :content="getContent"
    >
      <div class="row q-gutter-lg">
        <div>
          <div class="flex flex-center">
            <q-avatar size="64px">
              <q-img width="48px" :src="postData.link" />
            </q-avatar>
          </div>
          <span class="text-center">
            <q-badge
              rounded
              outline
              :color="postData.color"
              :label="postData.label"
            />
          </span>
        </div>

        <div class="col">
          <div
            class="row items-center no-wrap"
            :style="{
              height: props.hashtag.slice(1).length > 0 ? '64px' : '100%'
            }"
          >
            <span class="title">{{ title }}</span>
          </div>
          <div class="row q-gutter-sm">
            <span v-for="tag in props.hashtag.slice(1)" :key="tag">
              <q-badge rounded outline :color="calcColor(tag)" :label="tag" />
            </span>
          </div>
        </div>

        <div class="col-3">
          <div class="row no-wrap items-center">
            <span class="text-overline text-red">{{
              category.toUpperCase()
            }}</span>
            <span class="text-bold">&nbsp;·&nbsp;</span>
            <span class="text-caption">{{ getPredictedTimeToRead }}</span>
          </div>
          <div>
            <span>Created : {{ formattedDateTime }}</span>
            <span>Written By : {{ createdBy }}</span>
          </div>
        </div>
      </div>
    </slot>
  </article>

  <Transition name="articleSlider">
    <div v-if="swch" class="q-ml-lg">
      <slot name="slide"></slot>
    </div>
  </Transition>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';

const swch = ref(false);
const isHovered = ref(false);
const slideSwitch = () => {
  isHovered.value = !isHovered.value;
  swch.value = !swch.value;
};

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
  }
});

// GotoPostDetails
const router = useRouter();
// const goPostDetails = () =>
//   router.push({ name: 'PostDetails', params: { id: props.id } });
const goPostDetails = () =>
  router.push({
    name: 'Index',
    query: {
      post: props.folder.replace('/', ''),
      markdown: props.filename.replace('/', '')
    }
  });

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

const calcColor = tags => {
  if (tags === 'Spring') return 'Spring';
  else if (tags === 'Vue') return 'Vue';
  else if (tags === 'Python') return 'Python';
  else if (tags === 'Bash') return 'Bash';
  else if (tags === 'Java') return 'Java';
  else if (tags === 'JavaScript') return 'JavaScript';
  else if (tags === 'Quasar') return 'Quasar';
  else if (tags === 'HackTheBox') return 'HackTheBox';
  else if (tags === 'TryHackMe') return 'TryHackMe';
  else return 'Unknown';
};

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
    returnObject.link = 'Spring.svg';
    returnObject.color = 'Spring';
    returnObject.label = 'Spring';
  } else if (props.hashtag[0] === 'Vue') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #42b883, 0 0 11px #42b883, 0 0 25px #42b883, 0 0 45px #42b883'
      : 'none';
    returnObject.link = 'Vue.svg';
    returnObject.color = 'Vue';
    returnObject.label = 'Vue';
  } else if (props.hashtag[0] === 'Python') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #3d7daf, 0 0 11px #3d7daf, 0 0 25px #3d7daf, 0 0 45px #3d7daf'
      : 'none';
    returnObject.link = 'Python.svg';
    returnObject.color = 'Python';
    returnObject.label = 'Python';
  } else if (props.hashtag[0] === 'Bash') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #fefefe, 0 0 11px #fefefe, 0 0 25px #fefefe, 0 0 45px #fefefe'
      : 'none';
    returnObject.link = 'Bash.svg';
    returnObject.color = 'Bash';
    returnObject.label = 'Bash';
  } else if (props.hashtag[0] === 'Java') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #b07219, 0 0 11px #b07219, 0 0 25px #b07219, 0 0 45px #b07219'
      : 'none';
    returnObject.link = 'Java.svg';
    returnObject.color = 'Java';
    returnObject.label = 'Java';
  } else if (props.hashtag[0] === 'JavaScript') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #f1e05a, 0 0 11px #f1e05a, 0 0 25px #f1e05a, 0 0 45px #f1e05a'
      : 'none';
    returnObject.link = 'JavaScript.svg';
    returnObject.color = 'JavaScript';
    returnObject.label = 'JavaScript';
  } else if (props.hashtag[0] === 'Quasar') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #00b4ff, 0 0 11px #00b4ff, 0 0 25px #00b4ff, 0 0 45px #00b4ff'
      : 'none';
    returnObject.link = 'Quasar.svg';
    returnObject.color = 'Quasar';
    returnObject.label = 'Quasar';
  } else if (props.hashtag[0] === 'HackTheBox') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #9fef00, 0 0 11px #9fef00, 0 0 25px #9fef00, 0 0 45px #9fef00'
      : 'none';
    returnObject.link = 'HackTheBox.svg';
    returnObject.color = 'HackTheBox';
    returnObject.label = 'HackTheBox';
  } else if (props.hashtag[0] === 'TryHackMe') {
    returnObject.shadow = isHovered.value
      ? '0 0 3px #ff0000, 0 0 11px #ff0000, 0 0 25px #ff0000, 0 0 45px #ff0000'
      : 'none';
    returnObject.link = 'TryHackMe.svg';
    returnObject.color = 'TryHackMe';
    returnObject.label = 'TryHackMe';
  }
  return returnObject;
});
</script>

<style lang="scss" scoped>
.text-Spring {
  color: #6cb52d !important;
}
.text-Vue {
  color: #42b883 !important;
}
.text-Python {
  color: #3d7daf !important;
}
.text-Bash {
  color: #fefefe !important;
}
.text-Java {
  color: #b07219 !important;
}
.text-JavaScript {
  color: #f1e05a !important;
}
.text-Quasar {
  color: #00b4ff !important;
}
.text-HackTheBox {
  color: #9fef00 !important;
}
.text-TryHackMe {
  color: #ff0000 !important;
}
span {
  display: block;
}

.articleSlider-enter-from {
  opacity: 0;
}
.articleSlider-enter-active {
  transition: opacity 0.5s ease;
}
.articleSlider-enter-to {
  opacity: 1;
}

article {
  // border: 1px solid $font-color;
  border-radius: 7px;
  margin: 20px 5px 20px 5px;
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--box-shadow-color);
  }
}
.title {
  font-size: 22px;
  font-weight: 900;
}
</style>
