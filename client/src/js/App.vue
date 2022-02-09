<template>
  <div class="containter">
    <n-space vertical>
      <h3>¿Eres más de Marvel o de DC?</h3>
      <n-radio-group name="rbg-publisher">
        <n-radio-button
          v-for="company in companies"
          :key="company.value"
          :value="company.value"
          @click="clickedPublisher(company)"
        >
          {{ company.label }}
        </n-radio-button>
      </n-radio-group>
      <p id="charactersByPublisher"></p>
    </n-space>

    <n-space vertical>
      <h3>¿A qué te gustaría dedicarte?</h3>
      <n-input v-model:value="occupation" type="text" placeholder="inventor" style="width: 300px"></n-input>
      <n-button @click="professionHints">Pistas</n-button>
      <p id="charactersByOccupation"></p>
    </n-space>
    
    <br>
    <n-space>
      <n-button secondary @click="clear" type="warning">LIMPIAR</n-button>
      <n-button primary @click="getData" type="warning">CONSULTAR</n-button>
    </n-space>
    <br>

    <h3 class="results">Resultados</h3>
    <n-space v-if="results != null" horizontal class="results">
      <div v-for="(item, index) in results" :key="index">
        <n-card :title=item.name style="max-width: 200px">
          <template #cover>
            <img :src=item.img>
          </template>
          <b>Enemigos:</b> {{ item.enemies.toString().replace(/,/g, ", ") }} <br>
          <b>Equipos:</b> {{ item.teams.toString().replace(/,/g, ", ") }}
        </n-card>
      </div>
    </n-space>
    <h2 v-else class="results">¡Oh, no! No hay resultados con esa combinación &#128531;</h2>
  </div>
</template>


<script>

import { NButton, NSpace, NRadioGroup, NRadioButton, NCheckbox, NInput, NCard } from "naive-ui";

const URL = "http://localhost:3000/api";

export default {
  name: "App",
  components: {
    NSpace,
    NRadioGroup,
    NRadioButton,
    NCheckbox,
    NButton,
    NInput,
    NCard
  },
  data () {
    return {
      selectedCompany: null,
      companies: {
        Q173496: {
          value: "Q173496",
          label: "Marvel Comics"
        },
        Q2924461: {
          value: "Q2924461",
          label: "DC Comics"
        },
      },
      occupation: null,
      showOccupationsHints: false,
      results: {}
    }
  },
  mounted() {
    this.selectedCompany = null;
    this.occupation = null;
    this.results = [];

    document.getElementById("charactersByPublisher").style.display = "none";
    document.getElementById("charactersByOccupation").style.display = "none";
    document.querySelectorAll(".results").forEach(el => el.style.display = "none");
  },
  methods: {
    getData() {
      if (!this.checkParameters())
        return;
   
      fetch(`${URL}/whoiam`, {
        method: "POST",
        body: JSON.stringify({
          publisher: this.selectedCompany.value,
          occupation: this.occupation
        }),
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data == null || data == {} || data.results == undefined || data.results.bindings.length == 0) {
            this.results = null;
          }
          else {
            this.results = [];
            let partialResults = {};

            for (obj of data.results.bindings) {
              if (partialResults[obj.officialName.value] == null)
                partialResults[obj.officialName.value] = {
                  "name": obj.officialName.value,
                  "enemies": [],
                  "teams": [],
                  "id": (obj.comicCharacter != null) ? obj.comicCharacter.value : "-",
                  "img": (obj.image != null) ? obj.image.value : "https://i0.wp.com/mundowin.com/wp-content/uploads/2019/06/windows-computer-user-profile.png?w=832&ssl=1"
                }

              if (obj.enemyLabel != null)
                partialResults[obj.officialName.value].enemies.push(obj.enemyLabel.value);
            
              if (obj.teamLabel != null)
                partialResults[obj.officialName.value].teams.push(obj.teamLabel.value);
            }

            Object.values(partialResults).forEach(val => {
              val.enemies = [...new Set(val.enemies)];
              val.teams = [...new Set(val.teams)];
              this.results.push(val)
            });

            document.querySelectorAll(".results").forEach(el => el.style.display = "block");
          }
        });
    },
    professionHints() {
      this.showOccupationsHints = !this.showOccupationsHints;
      if (this.showOccupationsHints)
        fetch(`${URL}/professions`)
          .then(res => res.json())
          .then(data => {
            const p = document.getElementById("charactersByOccupation");
            p.style.display = "block";  
            p.innerHTML = "";
            
            for (obj of data.results.bindings) {
              p.innerHTML += `${obj.label.value}, `;
            }
          })
      else 
        document.getElementById("charactersByOccupation").style.display = "none";
    },
    clickedPublisher(selected) {
      this.selectedCompany = selected;
      fetch(`${URL}/${this.selectedCompany.value}/characters`)
        .then(res => res.json())
        .then(data => {
          const p = document.getElementById("charactersByPublisher");
          p.style.display = "block"
          p.innerHTML = "";

          for (obj of data.results.bindings) {
            p.innerHTML += `${obj.officialName.value}, `;
          }
        });
    },
    clickedOccupation(selected) {
      this.selectedCompany = selected;
    },
    checkParameters() {
      if (this.selectedCompany == null && this.occupation == null)
        window.alert("Tienes que especificar una editorial y una profesión")
      else if (this.selectedCompany == null)
        window.alert("Tienes que especificar una editorial")
      else if (this.occupation == null) 
        window.alert("Tienes que especificar una profesión")
      else 
        return true;
      return false;
    },
    clear() {
      location.reload();
    }
  }
}
</script>

