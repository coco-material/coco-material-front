<template src="./CocoTeam.html" lang="html"></template>
<style src="./CocoTeam.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CocoTeam',
  data() {
    return {
      members: [
        {
          name: 'Marina López',
          position: 'Front-End Developer',
          link: 'https://kaleidos.net/kaleiders/FF8A80/',
        },
        {
          name: 'Natacha Menjibar',
          position: 'UX/UI Designer',
          link: 'https://kaleidos.net/kaleiders/492858/',
        },
        {
          name: 'Esther Moreno',
          position: 'Creator & Illustrator',
          link: 'https://kaleidos.net/kaleiders/720B34/',
        },
        {
          name: 'Yamila Moreno',
          position: 'Back-End Developer',
          link: 'https://kaleidos.net/kaleiders/D70A53/',
        },
        {
          name: 'Ramiro Sánchez',
          position: 'Front-End Developer',
          link: 'https://kaleidos.net/kaleiders/E32841/',
        },
        {
          name: 'David Barragán',
          position: 'Naive Developer',
          link: 'https://kaleidos.net/kaleiders/FFF8E7/',
        },
      ],
    }
  },
})
</script>
