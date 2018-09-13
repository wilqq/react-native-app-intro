import React from 'react'
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export const DoneButton = ({
  styles, onDoneBtnClick, onNextBtnClick,
  rightTextColor, isDoneBtnShow,
  doneBtnLabel, nextBtnLabel, showDoneButton
}) => {
  return (
    <View style={[styles.btnContainer, { height: 0 }]}>
      <TouchableOpacity style={styles.full}
        onPress={ isDoneBtnShow ? onDoneBtnClick : onNextBtnClick}
      >
       <Text style={[styles.nextButtonText, { color: rightTextColor }]}>
         {isDoneBtnShow ? (showDoneButton && doneBtnLabel) : nextBtnLabel}
       </Text>
      </TouchableOpacity>
    </View>
  )
}

export default DoneButton
