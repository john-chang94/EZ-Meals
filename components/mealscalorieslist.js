import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
// import NutrientsFromCalories from './nutrientsfromcalories';
import axios from 'axios';
import { extractNutrients } from './helper';
import { NUTRIENTSFROMCALORIES, CALORIESHOME, HOME } from './constants';
// import { MainStyle } from '../styles';
import apiKey from '../config/firebase';

export default class MealsCaloriesList extends React.Component {

    // this.props = {
    // imagesTitlesIDs: this.state.imagesTitlesIDs,
    // seeNutrients: this.seeNutrients,
    // nutrientsList: this.state.convertedNutrients
    // }
    state = {
        calories: []
    }

    seeNutrients = id => {
        let config = {
            headers: {
                'X-Mashape-Key': apiKey,
                "Accept": 'text/html'
            }
        }

        axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${id}/nutritionWidget?defaultCss=false`, config)
            .then(response => {
                console.log("HERE", id)
                console.log('Meals Calories List', response.data)
                let convertedNutrients = extractNutrients(response.data)
                console.log(JSON.stringify(convertedNutrients));
                let neededNutrientsForPieChart = convertedNutrients.filter(x => (x.type === 'Calories') || (x.type === 'Fat') || (x.type === 'Protein') || (x.type === 'Carbohydrates'))
                console.log('Needed Nutrients for Pie chart', neededNutrientsForPieChart)
                let calories = neededNutrientsForPieChart.find(x => x.type === 'Calories').value;

                let modifiedNutrientsForPieChart = neededNutrientsForPieChart.map(function (obj) {
                    switch (obj.type) {
                        case 'Protein':
                            return { ...obj, value: Math.ceil((((obj.value * 4) / calories) * 100)) }
                        case 'Carbohydrates':
                            return { ...obj, value: Math.ceil((((obj.value * 4) / calories) * 100)) }
                        case 'Fat':
                            return { ...obj, value: Math.ceil((((obj.value * 9) / calories) * 100)) }
                        default:
                            return obj
                    }
                })

                const props = {
                    nutrientsList: modifiedNutrientsForPieChart,
                    imagesTitlesIDs: this.props.imagesTitlesIDs //we need this in order to go back and see the same list that is being shown prior.  App is storing the images, titles, and IDs so that we can access it again.
                }

                this.props.link(NUTRIENTSFROMCALORIES, props);
            });
    }

    saveMeal(item) {
        this.props.saveMeals(item);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <TouchableOpacity style={styles.backButton} onPress={() => { this.props.link(CALORIESHOME) }}>
                        <Text style={{ marginLeft: 30 }}> Back </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => { this.props.link(HOME) }}>
                        <Text style={{ marginLeft: 30 }}> Home </Text>
                    </TouchableOpacity>

                </View>
                <FlatList
                    data={this.props.imagesTitlesIDs}
                    renderItem={({ item }) =>
                        <View>
                            <View >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ marginTop: 10, fontSize: 30, marginBottom: 15, fontWeight: 'bold' }}>{item.title}</Text>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.image}
                                    />
                                    <Text style={{ marginBottom: 15 }}>{item.summary}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <TouchableOpacity style={styles.button} onPress={this.saveMeal.bind(this, item)}>
                                    <Text style={styles.textStyle}>Save Meal </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => { this.seeNutrients(item.id) }}>
                                    <Text style={styles.textStyle}>See Nutrients </Text>
                                </TouchableOpacity>
                            </View>
                        </ View>
                    }
                    keyExtractor={(item, index) => index + ""} // index has to be string, which is why we have """
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({

    button: {
        backgroundColor: 'powderblue',
        height: 40,
        width: 100,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10
    },
    backButton: {
        backgroundColor: 'lightgray',
        height: 40,
        width: 100,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 30,
    },
    resultsView: {
        alignItems: 'center',
        marginTop: 25
    },
    image: {
        width: 400,
        height: 250,
        marginBottom: 20
    },
});
