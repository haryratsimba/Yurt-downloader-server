<template>
<li class="list-group-item">
  <img class="img-circle media-object pull-left" :src="thumbnail" width="32" height="32">
  <div class="media-body">
    <span class="media-title">{{download.title | decodeString}}</span>
    <span class="pull-right">{{download.progressPercentage  | round}}%</span>
    <div class="media-content">
      <p>
        {{download.progressReceived | formatByte }} of {{download.size | formatByte}}
      </p>
      <progress :value="download.progressPercentage | round" max="100"></progress>
    </div>
  </div>
</li>
</template>

<script>
export default {
  name: 'download',
  props: {
    download: {
      type: Object,
      required: true
    }
  },
  computed: {
    thumbnail() {
      return this.download.thumbnail || './static/img/photo-camera.svg';
    }
  },
  filters: {
    round(value) {
      let valueAsFloat = parseFloat(value);
      if (isNaN(valueAsFloat)) {
        return 0;
      }
      return Math.round(valueAsFloat);
    },
    formatByte(value) {
      let bytes = parseInt(value);
      if (isNaN(bytes)) {
        return '0B';
      }
      let greatestUnit = bytes / 1000;
      let suffix = 'KB';
      if (greatestUnit > 1000) {
        greatestUnit = greatestUnit / 1000;
        suffix = 'MB';
      }
      return greatestUnit.toFixed(2) + suffix;
    },
    decodeString(value) {
      const htmlChars = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
      };
      return decodeURIComponent(value).replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, occurence => htmlChars[occurence]);
    }
  }
}
</script>
